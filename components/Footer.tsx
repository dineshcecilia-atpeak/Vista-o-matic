import { FaLocationArrow } from "react-icons/fa6";
import { Spotlight } from "./ui/Spotlight";
import { socialMedia } from "@/data";  // Ensure the path is correct
import MagicButton from "./ui/MagicButton";

const Footer = () => {
  return (
    <footer className="w-full mb-[100px] md:mb-5 pb-10" id="contact">
      <div>
        <Spotlight className="h-screen" fill="grey" />
        <Spotlight className="left-full h-[80vh]" fill="violet" />
        <Spotlight className="left-80 h-[80vh] w-[50vw]" fill="#87CEEB" />
      </div>
      {/* background grid */}
      <div className="w-full absolute left-0 -bottom-72 min-h-96">
        <img
          src="/footer-grid.svg"
          alt="grid"
          className="w-full h-full opacity-100"
        />
      </div>

      <div className="flex flex-col items-center">
        <h1 className="heading lg:max-w-[45vw]">
          Ready to take <span className="text-purple">your</span> digital
          presence to the next level?
        </h1>
        <p className="text-white-200 md:mt-10 my-5 text-center">
          Reach out to me today and let&apos;s discuss how I can help you
          achieve your goals.
        </p>
        <a href="mailto:akashjana663@gmail.com">
          <MagicButton
            title="Let's get in touch"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>

      <div className="flex mt-16 md:flex-row flex-col justify-between items-center">
        <p className="md:text-base text-sm md:font-normal font-light">
          Copyright © 2024 Akash Jana
        </p>

        <div className="flex items-center md:gap-3 gap-6">
          {socialMedia && socialMedia.length > 0 ? (
            socialMedia.map((info) => (
              <a
                key={info.id}
                href={info.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300 hover:scale-105 transition-transform duration-300 ease-in-out"
              >
                <img src={info.icon} alt="social media icon" className="w-6 h-6" />
              </a>
            ))
          ) : (
            <p>No social media links available.</p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
