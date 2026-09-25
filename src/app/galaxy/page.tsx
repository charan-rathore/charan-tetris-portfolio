import type { Metadata } from "next";
import { GalaxyAtlas } from "@/components/galaxy/GalaxyAtlas";

export const metadata: Metadata = {
  title: "The work galaxy · Charan Rathore",
  description: "Follow projects, open-source work and ideas back to their source.",
};
export default function GalaxyPage() { return <GalaxyAtlas />; }
