import { json, type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import toolkitStyles from "@tantainnovative/ndpr-toolkit/styles?url";

import { ConsentRoot } from "~/components/ConsentRoot";
import { readConsentFromRequest } from "~/lib/parse-consent-cookie";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: toolkitStyles }];

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ initialConsent: readConsentFromRequest(request) });
}

export default function App() {
  const { initialConsent } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <Outlet />
        <ConsentRoot initialConsent={initialConsent} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
