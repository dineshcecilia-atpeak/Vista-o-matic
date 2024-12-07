"use client";
import { IconCloud } from "@/components/ui/IconCloud";

const slugs = [
  "javascript",
  "java",
  "react",
  "html5",
  "css3",
  "nodedotjs",
  "nextdotjs",
  "vercel",
  "git",
  "github",
  "visualstudiocode",
  "figma",
  "python",
  
];

function Skills() {
  return (
    <div className="mt-0 py-0">
      <h1 className="heading">
        Skills &amp;{" "}
        <span className="text-purple">Technologies</span>
      </h1>
      <IconCloud iconSlugs={slugs} />
    </div>
  );
}

export default Skills;
