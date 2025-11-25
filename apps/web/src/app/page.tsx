import { Suspense } from "react";
import LoginPage from "./login-page-client";

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
