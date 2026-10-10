import { HTMLNumber } from "@samueldavis/solidlib";
import { currency } from "../utils/format";

export default function Money(props: { value: number }) {
  return <HTMLNumber value={props.value} money highlight options={currency} />;
}
