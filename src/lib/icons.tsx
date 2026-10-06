import type { IconType } from "react-icons";
import {
  SiAndroid, SiAnsible, SiAngular, SiAnthropic, SiApachekafka, SiApple, SiArduino, SiBitbucket, SiBlender,
  SiClaude, SiCloudflare, SiCplusplus, SiCss, SiCypress, SiDart, SiDjango, SiDocker, SiDotnet, SiElasticsearch,
  SiExpress, SiFastapi, SiFigma, SiFirebase, SiFlask, SiFlutter, SiGit, SiGithubactions, SiGitlab, SiGo,
  SiGooglecloud, SiGooglegemini, SiGraphql, SiHtml5, SiHuawei, SiHuggingface, SiJavascript, SiJenkins, SiJest,
  SiJira, SiJupyter, SiKeras, SiKotlin, SiKubernetes, SiLangchain, SiLinux, SiMediapipe, SiMongodb, SiMysql,
  SiNetlify, SiNextdotjs, SiNginx, SiNodedotjs, SiNotion, SiNumpy, SiNuxt, SiOllama, SiOpenai, SiOpencv, SiPandas,
  SiPostgresql, SiPostman, SiPrisma, SiPython, SiPytorch, SiRabbitmq, SiRaspberrypi, SiReact, SiRedis, SiRedux,
  SiRust, SiScikitlearn, SiSelenium, SiSlack, SiSpring, SiSqlite, SiStorybook, SiSupabase, SiSvelte, SiSwift,
  SiTailwindcss, SiTensorflow, SiTerraform, SiThreedotjs, SiTrello, SiTypescript, SiUltralytics, SiUnity,
  SiVercel, SiVite, SiVuedotjs, SiWebgl, SiWebpack,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { FaLinkedin, FaMedium } from "react-icons/fa";
import { DiMsqlServer } from "react-icons/di";
import {
  VscBeaker, VscBook, VscBriefcase, VscCalendar, VscCloud, VscCode, VscComment, VscDatabase, VscDeviceCamera,
  VscFile, VscFileMedia, VscFilePdf, VscFolder, VscGame, VscGithub, VscGlobe, VscHeart, VscHome, VscJson,
  VscLayers, VscLightbulb, VscLink, VscMail, VscMarkdown, VscMegaphone, VscMortarBoard, VscNote,
  VscOrganization, VscPerson, VscPlay, VscProject, VscRocket, VscServer, VscShield, VscStarFull, VscTag,
  VscTarget, VscTerminal, VscTools, VscVerified, VscVscode, VscWand,
} from "react-icons/vsc";
import type { IconKey } from "./icon-keys";

const CursorIcon: IconType = (props) => {
  const { size = "1em", color, style, className, title } = props;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color ?? "currentColor"} style={style} className={className} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
    </svg>
  );
};

export const ICONS: Record<IconKey, IconType> = {
  markdown: VscMarkdown, typescript: VscCode, json: VscJson, file: VscFile, code: VscCode, pdf: VscFilePdf,
  image: VscFileMedia, play: VscPlay, link: VscLink, globe: VscGlobe, github: VscGithub, medium: FaMedium,
  linkedin: FaLinkedin, email: VscMail,
  folder: VscFolder, person: VscPerson, rocket: VscRocket, book: VscBook, certificate: VscMortarBoard,
  mail: VscMail, briefcase: VscBriefcase, tools: VscTools, beaker: VscBeaker, camera: VscDeviceCamera,
  game: VscGame, cloud: VscCloud, database: VscDatabase, server: VscServer, layers: VscLayers,
  lightbulb: VscLightbulb, megaphone: VscMegaphone, note: VscNote, organization: VscOrganization,
  project: VscProject, star: VscStarFull, heart: VscHeart, calendar: VscCalendar, comment: VscComment,
  home: VscHome, shield: VscShield, tag: VscTag, target: VscTarget, terminal: VscTerminal,
  verified: VscVerified, wand: VscWand,
  ultralytics: SiUltralytics, mediapipe: SiMediapipe, opencv: SiOpencv, tensorflow: SiTensorflow,
  pytorch: SiPytorch, scikitlearn: SiScikitlearn, keras: SiKeras, numpy: SiNumpy, pandas: SiPandas,
  jupyter: SiJupyter, huggingface: SiHuggingface, langchain: SiLangchain, ollama: SiOllama, openai: SiOpenai,
  anthropic: SiAnthropic, claude: SiClaude, gemini: SiGooglegemini, cursor: CursorIcon, huawei: SiHuawei,
  googlecloud: SiGooglecloud, aws: FaAws, cloudflare: SiCloudflare, vercel: SiVercel, netlify: SiNetlify,
  supabase: SiSupabase, firebase: SiFirebase, nextjs: SiNextdotjs, react: SiReact, vue: SiVuedotjs,
  nuxt: SiNuxt, angular: SiAngular, svelte: SiSvelte, flutter: SiFlutter, dart: SiDart, kotlin: SiKotlin,
  android: SiAndroid, swift: SiSwift, apple: SiApple, html: SiHtml5, css: SiCss, tailwind: SiTailwindcss,
  javascript: SiJavascript, typescriptlang: SiTypescript, threejs: SiThreedotjs, webgl: SiWebgl, vite: SiVite,
  webpack: SiWebpack, redux: SiRedux, python: SiPython, fastapi: SiFastapi, django: SiDjango, flask: SiFlask,
  nodejs: SiNodedotjs, express: SiExpress, dotnet: SiDotnet, spring: SiSpring, go: SiGo, rust: SiRust,
  cplusplus: SiCplusplus, graphql: SiGraphql, prisma: SiPrisma, postgresql: SiPostgresql, mysql: SiMysql,
  mssql: DiMsqlServer, sqlite: SiSqlite, mongodb: SiMongodb, redis: SiRedis, elasticsearch: SiElasticsearch,
  rabbitmq: SiRabbitmq, kafka: SiApachekafka, docker: SiDocker, kubernetes: SiKubernetes,
  terraform: SiTerraform, ansible: SiAnsible, jenkins: SiJenkins, githubactions: SiGithubactions,
  nginx: SiNginx, linux: SiLinux, git: SiGit, gitlab: SiGitlab, bitbucket: SiBitbucket, vscode: VscVscode,
  figma: SiFigma, blender: SiBlender, unity: SiUnity, arduino: SiArduino, raspberrypi: SiRaspberrypi,
  selenium: SiSelenium, jest: SiJest, cypress: SiCypress, storybook: SiStorybook, postman: SiPostman,
  notion: SiNotion, slack: SiSlack, trello: SiTrello, jira: SiJira,
};

/** Brand-ish colors for file icons in the explorer, matching the original look. */
export const ICON_COLORS: Partial<Record<IconKey, string>> = {
  markdown: "#519aba", typescript: "#007acc", json: "#cbcb41", image: "#a074c4", pdf: "#e05252",
  play: "#10b981", github: "#fafafa", medium: "#ffffff", linkedin: "#0077b5", email: "#a074c4",
  folder: "#dcb67a", link: "#3794ff",
};

export function Icon({ name, size = 16, color, className, title }: { name?: string | null; size?: number; color?: string; className?: string; title?: string }) {
  const Component = (name && ICONS[name as IconKey]) || VscFile;
  return <Component size={size} color={color ?? (name ? ICON_COLORS[name as IconKey] : undefined)} className={className} title={title} aria-hidden={title ? undefined : true} />;
}
