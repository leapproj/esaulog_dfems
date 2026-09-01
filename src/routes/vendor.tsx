import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Page, PageHeader, Stat, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { php } from "@/lib/format";
import { addProduct, getVendorDesk, setVendorBooster } from "@/lib/server/engage";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor")({ component: VendorPage });

function VendorPage() {
  return (
    <AuthGate>
      <Desk />
    </AuthGate>
  );
}

function Desk() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["vendor"], queryFn: () => getVendorDesk() });
  const [vendorId, setVendorId] = useState("vnd_kakanin");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(100);
  const add = useMutation({
    mutationFn: () => addProduct({ data: { vendorId, name, price_php: price } }),
    onSuccess: () => {
      toast.success("Product listed");
      setName("");
      void qc.invalidateQueries({ queryKey: ["vendor"] });
    },
  });
  const boost = useMutation({
    mutationFn: (id: string) => setVendorBooster({ data: { vendorId: id, booster: "booster" } }),
    onSuccess: () => {
      toast.success("MSME Booster on");
      void qc.invalidateQueries({ queryKey: ["vendor"] });
    },
  });
  return (
    <div className="min-h-screen">
      <TopBar kicker="Vendor commerce" />
      <Page>
        <PageHeader
          eyebrow="Not a POS"
          title="Vendor desk"
          description="Festival sales-management and digital-commerce visibility. Cash drawers, payroll, and kitchen boards stay outside eSAULOG."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Vendors" value={data?.vendors.length ?? "—"} />
          <Stat label="Products" value={data?.products.length ?? "—"} />
          <Stat label="Offers" value={data?.offers.length ?? "—"} />
          <Stat label="Coupons issued" value={data?.couponCount ?? "—"} />
        </div>
        <h2 className="mt-10 font-display text-2xl">Listings</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(data?.vendors ?? []).map((v) => (
            <div key={v.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{v.name}</p>
                <span className="text-xs text-muted">{v.booster}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{v.description}</p>
              <p className="mt-2 text-xs text-subtle">{v.location}</p>
              {v.booster === "free" ? (
                <Button className="mt-3" size="sm" variant="outline" onClick={() => boost.mutate(v.id)}>
                  Upgrade to MSME Booster
                </Button>
              ) : (
                <p className="mt-3 text-xs text-ok">Featured · coupons · analytics · Dayu visibility</p>
              )}
            </div>
          ))}
        </div>
        <h2 className="mt-10 font-display text-2xl">Add product</h2>
        <form
          className="mt-3 grid gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <select
            className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          >
            {(data?.vendors ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <Button type="submit">List</Button>
        </form>
        <div className="mt-6 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs text-muted uppercase">
              <tr className="border-b border-border">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {(data?.products ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.vendor_name}</td>
                  <td className="px-4 py-3 tabular-nums">{php(p.price_php)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Page>
    </div>
  );
}
