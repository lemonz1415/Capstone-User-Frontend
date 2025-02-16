"use client";

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-blue-900 text-white py-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-2xl font-bold">
          ExamPrep
        </button>

        {/* Centered Links */}
        <div className="flex items-center space-x-6">
          <button onClick={() => router.push('/exam')} className="hover:text-blue-200">
            Exam
          </button>
          <button onClick={() => router.push('/about')} className="hover:text-blue-200">
            About
          </button>
          <button onClick={() => router.push('/contact')} className="hover:text-blue-200">
            Contact
          </button>
        </div>

        {/* Sign In Button */}
        <button onClick={() => router.push('/signin')} className="hover:text-blue-200">
          Sign In
        </button>
      </div>
    </nav>
  );
};
