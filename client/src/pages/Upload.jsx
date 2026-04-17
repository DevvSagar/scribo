import UploadPanel from "../components/UploadPanel";

const Upload = () => (
  <section className="relative flex min-h-[calc(100svh-81px)] items-center overflow-hidden px-5 py-0 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
    <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.05),transparent_60%)]" />
    <div className="mx-auto w-full max-w-[1040px]">
      <UploadPanel />
    </div>
  </section>
);

export default Upload;
