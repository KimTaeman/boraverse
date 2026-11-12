import Link from "next/link";
import KeepsakeList from "@/components/keepsakes/list";
export default function Keepsakes() { return <><h1>My Keepsakes</h1><KeepsakeList /><p><Link href="/">Back to the village</Link></p></>; }
