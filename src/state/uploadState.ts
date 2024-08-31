import { createComputed, createEffect, createMemo, createRoot } from "solid-js";
import { createSignal } from "../utilities.tsx";
import {
  hasProperty,
  isNumber,
  NormalHeader,
  normalHeaders,
  Statement,
  Transaction,
  Upload,
  UploadStep,
} from "../types.ts";

const uploadState = createRoot(() => {
  const [getUpload, setUpload] = createSignal<undefined | Upload>(undefined);
  const [getHeaderMapping, setHeaderMapping] = createSignal<
    Partial<Record<NormalHeader, string>>
  >({});
  createEffect(() => {});
  const getHeaders = () => getUpload()?.headers;
  const getFields = (header: string) =>
    getUpload()?.rows.map((row) => row[header]);
  const addHeader = (id: NormalHeader, value: undefined | string) =>
    setHeaderMapping(({ [id]: _, ...rest }) =>
      value === undefined ? rest : { ...rest, [id]: value },
    );
  const getIsHeaderMappingComplete = () => {
    const mapping = getHeaderMapping();
    return normalHeaders.every((normal) => normal in mapping);
  };

  const getStatement = createMemo((): undefined | Statement => {
    const upload = getUpload();
    const headerMapping = getHeaderMapping();
    return upload && getIsHeaderMappingComplete()
      ? {
          name: upload.name,
          date: new Date(),
          transactions: upload.rows.map((row) => {
            return normalHeaders.reduce((acc, normal) => {
              const header = headerMapping[normal];
              if (!header || !hasProperty(header, row)) throw new TypeError();
              let value = row[header];
              switch (normal) {
                case "date":
                  return { ...acc, [normal]: new Date(value) };
                case "description":
                  return { ...acc, [normal]: value };
                case "amount":
                  return { ...acc, [normal]: parseFloat(value) };
              }
            }, {} as Transaction);
          }),
        }
      : undefined;
  });

  const getStep = createMemo(() => {
    if (getIsHeaderMappingComplete()) return UploadStep.Review;
    if (getUpload()) return UploadStep.MapHeaders;
    return UploadStep.Upload;
  });

  const getMaxStep = () =>
    Math.max(0, ...Object.values(UploadStep).filter(isNumber));

  const stepLabels: Record<UploadStep, string> = {
    [UploadStep.Upload]: "Upload a Bank Statement",
    [UploadStep.MapHeaders]: "Identify Pertinent Data",
    [UploadStep.Review]: "Review",
  };

  const getStepLabel = () => stepLabels[getStep()];

  createComputed(() => {
    getUpload();
    setHeaderMapping({});
  });

  return {
    setUpload,
    getHeaders,
    getFields,
    addHeader,
    getIsHeaderMappingComplete,
    getStatement,
    getStep,
    getMaxStep,
    getStepLabel,
  };
});

export default uploadState;
