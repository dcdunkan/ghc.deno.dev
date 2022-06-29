import { serve } from "https://deno.land/std@0.145.0/http/mod.ts";

serve(async (req) => {
  if (new URL(req.url).pathname === "/") {
    return Response.redirect("https://github.com/dcdunkan/ghc.deno.dev");
  }

  const splits = req.url.split("/");
  const owner = splits[3];
  const repo = splits[4]?.split("@")[0];
  const version = splits[4]?.split("@")[1];
  const file = splits.slice(5).join("/");

  if (!version) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/tags`,
    );
    if (!res.ok) new Response("Not found", { status: 400 });

    const tags = await res.json() as { name: string }[];

    if (tags?.[0]?.name) {
      return Response.redirect(
        `https://${splits[2]}/${owner}/${repo}@${tags[0].name}/${file}`,
      );
    }

    const res_ = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    const repo_ = await res_.json();

    if (repo_.default_branch) {
      return Response.redirect(
        `https://${splits[2]}/${owner}/${repo}@${repo_.default_branch}/${file}`,
      );
    }

    return new Response("Not found", { status: 400 });
  }

  const url =
    `https://raw.githubusercontent.com/${owner}/${repo}/${version}/${file}`;
  const res = await fetch(url);
  const text = await res.text();

  return new Response(text, { status: 200 });
});
