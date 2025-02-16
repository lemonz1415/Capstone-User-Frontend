"use client";

import Image from "next/image";
import NotFoundImg from "../../public/images/404-status-img.png";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mt-[-30px]">
        <Image
          src={NotFoundImg}
          alt="404 Not Found Image"
          width={500}
          height={300}
          unoptimized
        />
      </div>
      <div className="text-4xl font-bold text-gray-700">
        404 - Page Not Found
      </div>
      <div className="text-xl text-gray-400 mt-4 pb-6">
        The page you are looking for does not exist or has been moved.
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
}
