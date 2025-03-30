"use-client";

import Image from "next/image";
import AboutUsBackground from "../../../public/images/about-us.jpg";

const HeadingBackground = () => (
  <div className="absolute inset-0 h-[400px]">
    <Image
      src={AboutUsBackground}
      alt="Heading Background"
      fill
      style={{ objectFit: "cover" }}
    />
  </div>
);

export default function About() {
  return (
    <div>
      <HeadingBackground />
      <section className="h-[300px] text-center pt-[75px] text-white relative z-10">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-lg px-[280px] font-bold">
          The "Web Application for Practicing English Exam" is designed to help
          users improve their English proficiency by providing an interactive
          exam platform. Users can take practice exams and receive instant
          feedback while admins manage question sets. A personal dashboard helps
          users analyze their performance in various skill areas.
        </p>
      </section>
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 text-gray-800">
          <section className="mb-12 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Project Objectives</h2>
            <ul className="space-y-2 text-gray-700">
              <li>
                ✅ Provide an interactive platform for English exam practice
              </li>
              <li>✅ Allow admins to manage question sets efficiently</li>
              <li>
                ✅ Offer detailed performance analytics via a personal dashboard
              </li>
              <li>
                ✅ Improve users' English proficiency through targeted practice
              </li>
            </ul>
          </section>

          <section className="mb-12 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
            <p className="text-gray-700 mb-4">
              Built with modern web technologies to ensure scalability,
              security, and performance.
            </p>
            <ul className="grid grid-cols-2 gap-4 text-gray-700">
              <li>
                <strong>Frontend:</strong> Next.js (React) + Tailwind CSS
              </li>
              <li>
                <strong>Backend:</strong> Node.js + Express.js
              </li>
              <li>
                <strong>Database:</strong> MySQL
              </li>
              <li>
                <strong>Reverse Proxy:</strong> NGINX
              </li>
              <li>
                <strong>Containerization:</strong> Docker
              </li>
              <li>
                <strong>Deployment OS:</strong> Ubuntu (SIT Server)
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-gray-700 mb-4">
              We are a team of dedicated developers from SIT KMUTT, working
              together to create a seamless experience for English learners.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>👨‍💻 Surachet Pichaiwattanaporn – 64130500087</li>
              <li>👨‍💻 Supakorn Chat-anothai – 64130500111</li>
              <li>👨‍💻 Wachirawit Jitphitthayakul – 64130500122</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
