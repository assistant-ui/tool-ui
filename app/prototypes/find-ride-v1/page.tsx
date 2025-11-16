import PrototypeInstancePage from "../[slug]/page";

export const dynamic = "force-dynamic";

export default async function FindRideV1Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return PrototypeInstancePage({
    params: Promise.resolve({ slug: "find-ride-v1" }),
    searchParams,
  });
}
