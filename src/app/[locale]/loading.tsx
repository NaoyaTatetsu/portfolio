import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center justify-center px-16 font-sans mt-8 mb-8">
      <LoadingSpinner size={120} />
    </div>
  );
}
