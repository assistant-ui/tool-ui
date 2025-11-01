import { redirect } from "next/navigation";
import { getDefaultComponent } from "@/lib/components-registry";

export default function PlaygroundIndexPage() {
  const defaultComponent = getDefaultComponent();
  redirect(defaultComponent.path);
}
