import Approach from "@/components/Approach";
import Client from "@/components/Client";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import RecentProjects from "@/components/RecentProjects";
import Skills from "@/components/Skills";
import Dash from "@/components/Dash";
//import Dashboard from "@/components/Dashboard";

import { FloatingNav } from "@/components/ui/FloatingNav";
import { navItems } from "@/data";

export default function Home() {
  return (
    <main
    className="relative flex justify-center items-center flex-col overflow-clip mx-auto sm:px-10 px-5"
    style={{ backgroundColor: "#00132a" }} // Added background color here
  >      <div className="max-w-7xl w-full">
        <FloatingNav 
        navItems={navItems} />
        <Hero />
        <Skills />
        <Dash />
        

        {/* <RecentProject /> */}
        <Footer />
      </div>
    </main>
  );
}