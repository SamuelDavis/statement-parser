import { ExtendProps } from "../types.ts";
import { useMatch } from "@solidjs/router";

type Props = ExtendProps<"a">;

export default function Link(props: Props) {
  const getMatch = useMatch(() => props.href ?? "-");
  const getIsCurrent = () => Boolean(getMatch());
  return <a aria-current={getIsCurrent()} {...props} />;
}
