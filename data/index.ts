export const navItems = [
  { name: "About", link: "#about" },
  {
    name: "Camera Interface",
    link: "#camera-interface",
    subItems: [
      { name: "Feedback", link: "/Feedback" },
      { name: "Peoplecount", link: "/Peoplecount" },
      { name: "Air", link: "#Air" },
      { name: "Heatmap", link: "/Heatmap" },

    ],
  },
  { name: "Dashboard", link: "#Dashboard" },
  { name: "Contact", link: "#contact" },
];

// data/index.ts
export const socialMedia = [
  {
    platform: "Facebook",
    url: "https://facebook.com",
    icon: "facebook-icon"
  },
  {
    platform: "Twitter",
    url: "https://twitter.com",
    icon: "twitter-icon"
  },
  // Add more social media entries here
];

// Alternatively, if you're using a default export:
export default { socialMedia };


export const gridItems = [
  {
    id: 1,
    title: "I prioritize team/client collaboration, fostering open communication ",
    description: "",
    className:
      "lg:col-span-3 md:col-span-6 md:row-span-4 lg:min-h-[60vh] hover:scale-105 transition-transform duration-300 ease-in-out",
    imgClassName: "w-full h-full",
    titleClassName: "justify-end",
    img: "/b1.svg",
    spareImg: "",
  },
  {
    id: 2,
    title: "I'm very flexible with time zone communications",
    description: "",
    className:
      "lg:col-span-2 md:col-span-3 md:row-span-2 min-h-[40vh] select-none hover:scale-105 transition-transform duration-300 ease-in-out",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "",
    spareImg: "",
  },
  {
    id: 3,
    title: "My Resume",
    description: "Are you hiring? Check out ",
    className:
      "lg:col-span-2 md:col-span-3 md:row-span-2 flex hover:scale-105 transition-transform duration-300 ease-in-out",
    imgClassName: "",
    titleClassName: "justify-end",
    img: "",
    spareImg: "",
  },
  {
    id: 4,
    title: "Tech enthusiast with a passion for development.",
    description: "",
    className:
      "lg:col-span-2 md:col-span-3 md:row-span-1 hover:scale-105 transition-transform duration-300 ease-in-out",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "/grid.svg",
    spareImg: "/b4.svg",
  },
  {
    id: 5,
    title: "Clean Code and Modern Design",
    description: "Passionate about transforming ideas into reality.",
    className:
      "md:col-span-3 md:row-span-2 hover:scale-105 transition-transform duration-300 ease-in-out",
    imgClassName: "absolute right-0 bottom-0 md:w-96 w-60",
    titleClassName: "justify-center md:justify-start lg:justify-center",
    img: "/b5.svg",
    spareImg: "/grid.svg",
  },
  {
    id: 6,
    title: "Do you want to start a project together?",
    description: "",
    className:
      "lg:col-span-2 md:col-span-3 md:row-span-1 hover:scale-105 transition-transform duration-300 ease-in-out",
    imgClassName: "",
    titleClassName: "justify-center md:max-w-full max-w-60 text-center",
    img: "",
    spareImg: "",
  },
];

export const projects = [
  {
    id: 1,
    title: "CopilotMate",
    des: "CopilotMate is an open-source personal assistant designed to streamline productivity with an intuitive interface and a suite of essential tools.",
    img: "/copilotmate.png",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/fm.svg"],
    link: "https://youtu.be/qPVRPUH8ewU?si=PmCxfpnI30lgJRd0",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    id: 2,
    title: "Mystery Message",
    des: "Mystery Message allows users to send and receive anonymous messages, ensuring privacy and fostering honest communication without revealing identities.",
    img: "/p1.png",
    iconLists: ["/next.svg", "/re.svg", "/tail.svg", "/ts.svg", "/mongo.svg"],
    link: "github.com/AkashJana18/nextjs-project",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    id: 3,
    title: "Cryptack - Cryptocurrency tracker",
    des: "Compare different cryptocurrencies, view their graphs—prices, total volumes, market cap, etc.",
    img: "/p2.png",
    iconLists: [
      "/re.svg",
      "/css.svg",
      "/js.svg",
      "/chartjs.svg",
      "/fm.svg",
      "/mui.svg",
    ],
    link: "cryptack.netlify.app/",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    id: 4,
    title: "React Quiz with Timer",
    des: "React Quiz with Timer and Score is a React-based quiz app that tracks scores and time in real-time.",
    img: "/p4.png",
    iconLists: ["/re.svg", "/css.svg", "/js.svg"],
    link: "react-quiz-with-timer.netlify.app/",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
];

export const testimonials = [
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
];

export const companies = [
  {
    id: 1,
    name: "cloudinary",
    img: "/cloud.svg",
    nameImg: "/cloudName.svg",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    id: 2,
    name: "appwrite",
    img: "/app.svg",
    nameImg: "/appName.svg",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    id: 3,
    name: "HOSTINGER",
    img: "/host.svg",
    nameImg: "/hostName.svg",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    id: 4,
    name: "stream",
    img: "/s.svg",
    nameImg: "/streamName.svg",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
  {
    id: 5,
    name: "docker.",
    img: "/dock.svg",
    nameImg: "/dockerName.svg",
    hoverClassName: "hover:scale-105 transition-transform duration-300 ease-in-out",
  },
];

export const workExperience = [
  {
    id: 1,
    title: "Pretember Challenge",
    desc: "Developed CopilotMate, personal AI assistant which integrates tools like a to-do list, ai-enabled spreadsheet, expense tracker and other features.",
    className: "md:col-span-2 hover:scale-105 transition-transform duration-300 ease-in-out",
    thumbnail: "/exp1.svg",
  },
  {
    id: 2,
    title: "Open Source",
    desc: "Developed a JSON Field Renaming Component in Golang for Instill AI, implementing logic for renaming fields with conflict resolution. Additionally, created comprehensive unit tests to ensure its functionality and robustness.",
    className: "md:col-span-2 hover:scale-105 transition-transform duration-300 ease-in-out",
    thumbnail: "/exp2.svg",
  },
  {
    id: 3,
    title: "N/A",
    desc: "Worked on a range of technical projects.",
    className: "md:col-span-2 hover:scale-105 transition-transform duration-300 ease-in-out",
    thumbnail: "/exp3.svg",
  },
];
