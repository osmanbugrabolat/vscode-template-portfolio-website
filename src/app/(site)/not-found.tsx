import Link from "next/link";
import { VscError } from "react-icons/vsc";

export default function NotFound() {
  return (
    <div className="content-scroll">
      <div className="markdown-body not-found">
        <VscError size={40} aria-hidden className="not-found-icon" />
        <h1>404</h1>
        <p>Bu sayfa bulunamadı. / This page could not be found.</p>
        <p>
          <Link href="/">WhoAmI.md</Link>
        </p>
      </div>
    </div>
  );
}
