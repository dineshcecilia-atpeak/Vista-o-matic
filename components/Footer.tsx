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
        Ready to transform <span className="text-purple">supermarkets </span>
          with smart automation?

        </h1>
        <p className="text-white-200 md:mt-10 my-5 text-center">
        Connect with us today and discover how <span className="text-purple">Vista-o-matic</span> can bring security, efficiency, and sustainability to your store.

        </p>
        <a href="mailto:202201001.ceciliadds@student.xavier.ac.in">
          <MagicButton
            title="Let's get in touch"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>

      <div className="flex mt-16 md:flex-row flex-col justify-between items-center">
        <p className="md:text-base text-sm md:font-normal font-light">
          Copyright © 2024 Vista
        </p>

        
      </div>
    </footer>
  );
};

export default Footer;
