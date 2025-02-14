"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import HeadingImage from '../../public/images/heading-img-nobg.png'; 

const HeadingBackground = () => (
  <div className="absolute inset-0 w-full h-full">
    <Image
      src="/images/heading-bg.png"
      alt="Heading Background"
      fill 
      style={{ objectFit: "cover" }}
    />
  </div>
);

const FeatureBackground = () => (
  <svg
    className="absolute bottom-0 w-full h-auto"
    viewBox="0 0 1440 320"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0,224L48,208C96,192,192,160,288,149.3C384,139,480,149,576,160C672,171,768,181,864,186.7C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      fill="#0066FF"
    />
  </svg>
);

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Heading Section */}
      <section className="bg-white py-4 relative overflow-hidden">
        <HeadingBackground />
        <div className="container mx-auto px-4 flex items-center relative z-10">
          {/* Text Content */}
          <div className="w-full md:w-1/2 text-left">
            <h1 className="text-5xl font-bold text-[#0066FF] mb-6 leading-tight">
              Master Your Skills with ExamPrep
            </h1>
            <p className="text-xl text-[#475569] mb-10">
              Enhance your knowledge through our intelligent question bank and personalized learning experience.
            </p>
            <button
              onClick={() => router.push('/exam')}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-[#0066FF] rounded-full hover:bg-[#0056D2] transform hover:scale-105 transition-all duration-300"
            >
              Start Your Journey
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2">
            <Image
              src={HeadingImage}
              alt="Exam Preparation Illustration"
              width={900}
              height={700}
              className=""
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20 relative overflow-hidden">
        <FeatureBackground/>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#E0F2FE]">
              <div className="bg-[#E0F2FE] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2h002M9"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0066FF] mb-4">Diverse Question Bank</h3>
              <p className="text-[#475569]">Access thousands of curated questions across multiple categories and difficulty levels.</p>
            </div>


            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#E0F2FE]">
              <div className="bg-[#E0F2FE] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#0066FF] mb-4">Real-time Feedback</h3>
              <p className="text-[#475569]">
                Get instant performance insights and detailed explanations for every answer.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#E0F2FE]">
              <div className="bg-[#E0F2FE] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110-4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#0066FF] mb-4">Personalized Learning</h3>
              <p className="text-[#475569]">
                Adaptive learning path that adjusts to your skill level and progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
