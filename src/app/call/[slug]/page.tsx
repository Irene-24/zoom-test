import { getData } from "@/data/getToken";
import VideochatClientWrapper from "@/components/VideochatClientWrapper";
import Script from "next/script";

export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ userName?: string; role?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const userName = searchParams.userName ?? "Guest";
  const role = Number(searchParams.role ?? "1");
  const jwt = await getData(params.slug, userName, role);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* this component is defined separately as it imports the ZoomSDK and needs to be a client component */}
      <VideochatClientWrapper slug={params.slug} JWT={jwt} />
      <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
    </main>
  );
}
