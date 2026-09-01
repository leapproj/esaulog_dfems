import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Page, PageHeader } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  addCmsBlock,
  createCmsPage,
  getCmsWorkspace,
  publishCmsPage,
  saveCmsBlock,
} from "@/lib/server/erp";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/$festivalId/cms")({ component: CmsPage });

const KINDS = [
  { id: "hero", label: "Hero" },
  { id: "pathways", label: "Pathways" },
  { id: "stats", label: "Stats" },
  { id: "text", label: "Text" },
  { id: "program", label: "Program" },
  { id: "partners", label: "Partners" },
  { id: "cta", label: "Call to action" },
];

function CmsPage() {
  const { festivalId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["cms-ws", festivalId],
    queryFn: () => getCmsWorkspace({ data: festivalId }),
  });
  const [active, setActive] = useState(0);
  const pages = data?.pages ?? [];
  const page = pages[active];
  const blocks = useMemo(
    () => (data?.blocks ?? []).filter((b) => b.page_id === page?.id),
    [data?.blocks, page?.id],
  );
  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [kind, setKind] = useState("text");
  const [heading, setHeading] = useState("");
  const [blockBody, setBlockBody] = useState("");

  const addPage = useMutation({
    mutationFn: () =>
      createCmsPage({
        data: {
          festivalId,
          title: newTitle,
          slug: newTitle,
        },
      }),
    onSuccess: () => {
      setNewTitle("");
      toast.success("Page created");
      void qc.invalidateQueries({ queryKey: ["cms-ws", festivalId] });
    },
  });
  const publish = useMutation({
    mutationFn: (published: boolean) =>
      publishCmsPage({
        data: {
          festivalId,
          id: page!.id,
          published,
          title: title ?? page!.title,
          body: body ?? page!.body,
        },
      }),
    onSuccess: () => {
      toast.success("Page saved");
      void qc.invalidateQueries({ queryKey: ["cms-ws", festivalId] });
    },
  });
  const addBlock = useMutation({
    mutationFn: () =>
      addCmsBlock({
        data: { festivalId, pageId: page!.id, kind, heading, body: blockBody },
      }),
    onSuccess: () => {
      setHeading("");
      setBlockBody("");
      toast.success("Block added");
      void qc.invalidateQueries({ queryKey: ["cms-ws", festivalId] });
    },
  });
  const saveBlock = useMutation({
    mutationFn: (input: { id: string; heading: string; body: string; visible: boolean }) =>
      saveCmsBlock({ data: { festivalId, ...input } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cms-ws", festivalId] }),
  });

  return (
    <Page>
      <PageHeader
        eyebrow="TukodPH CMS"
        title="Festival website"
        description="WordPress-like control desk: pages, blocks, draft or publish. Same idea as cms.tukodph.com — structure over spectacle."
        actions={
          data?.festival ? (
            <Link to="/f/$slug" params={{ slug: data.festival.slug }}>
              <Button variant="outline" size="sm">
                Preview site
              </Button>
            </Link>
          ) : null
        }
      />
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]">
          <p className="px-2 py-1 text-xs tracking-wide text-muted uppercase">Pages</p>
          <div className="mt-1 flex flex-col gap-1">
            {pages.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActive(i);
                  setTitle(null);
                  setBody(null);
                }}
                className={`rounded-md px-3 py-2 text-left text-sm ${i === active ? "bg-surface-2" : "text-muted hover:bg-bg"}`}
              >
                {p.title}
                <span className="ml-2 text-[10px] uppercase text-subtle">
                  {p.published ? "live" : "draft"}
                </span>
              </button>
            ))}
          </div>
          <form
            className="mt-3 grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (newTitle) addPage.mutate();
            }}
          >
            <Input
              placeholder="New page title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Button type="submit" size="sm" variant="outline">
              Add page
            </Button>
          </form>
        </aside>
        {page ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <Label>Title</Label>
                  <Input value={title ?? page.title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label>Excerpt</Label>
                  <Textarea
                    value={body ?? page.body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => publish.mutate(true)}>
                    Publish
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => publish.mutate(false)}>
                    Save draft
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {blocks.map((b) => (
                <BlockEditor
                  key={b.id}
                  kind={b.kind}
                  heading={b.heading}
                  body={b.body}
                  visible={b.visible}
                  onSave={(next) => saveBlock.mutate({ id: b.id, ...next })}
                />
              ))}
            </div>
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <p className="text-xs tracking-wide text-muted uppercase">Add block</p>
              <div className="mt-3 grid gap-3">
                <select
                  className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                >
                  {KINDS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                />
                <Textarea
                  placeholder="Body"
                  value={blockBody}
                  onChange={(e) => setBlockBody(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!heading}
                  onClick={() => addBlock.mutate()}
                >
                  Insert block
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Create a page to start the website.</p>
        )}
      </div>
    </Page>
  );
}

function BlockEditor({
  kind,
  heading,
  body,
  visible,
  onSave,
}: {
  kind: string;
  heading: string;
  body: string;
  visible: boolean;
  onSave: (n: { heading: string; body: string; visible: boolean }) => void;
}) {
  const [h, setH] = useState(heading);
  const [b, setB] = useState(body);
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-[10px] tracking-wide text-muted uppercase">{kind}</p>
      <Input className="mt-2" value={h} onChange={(e) => setH(e.target.value)} />
      <Textarea className="mt-2" value={b} onChange={(e) => setB(e.target.value)} />
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onSave({ heading: h, body: b, visible })}>
          Save block
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onSave({ heading: h, body: b, visible: !visible })}
        >
          {visible ? "Hide" : "Show"}
        </Button>
      </div>
    </div>
  );
}
