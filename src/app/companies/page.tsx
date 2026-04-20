"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyForm } from "@/components/forms/company-form";
import { formatCurrency } from "@/lib/utils";
import { Plus, Building2, MapPin, Search, ChevronRight } from "lucide-react";

export default function CompaniesPage() {
  const { companies, deals } = useData();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.codename?.toLowerCase().includes(q) ?? false) ||
      (c.sector?.name.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Target companies, portfolio companies, and prospects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name, sector, or codename..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-400">
            <Building2 className="h-8 w-8 mb-3" />
            <p className="text-sm font-medium">{search ? "No companies match your search" : "No companies yet"}</p>
            <p className="text-xs mt-1">{search ? "Try a different keyword" : "Add your first company to get started"}</p>
          </div>
        )}
        {filtered.map((company) => {
          const companyDeals = deals.filter((d) => d.companyId === company.id);
          return (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <Card hover className="group">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                        {company.name}
                      </h3>
                      {company.codename && (
                        <span className="text-xs text-brand-600 font-medium">
                          {company.codename}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {company.sector && (
                      <Badge variant="outline">{company.sector.name}</Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>

                {company.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {company.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {company.revenueMm && (
                    <div className="text-center py-2 bg-slate-50 rounded-md">
                      <p className="text-xs text-slate-400">Revenue</p>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(company.revenueMm)}
                      </p>
                    </div>
                  )}
                  {company.ebitdaMm && (
                    <div className="text-center py-2 bg-slate-50 rounded-md">
                      <p className="text-xs text-slate-400">EBITDA</p>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(company.ebitdaMm)}
                      </p>
                    </div>
                  )}
                  {company.employeeCount && (
                    <div className="text-center py-2 bg-slate-50 rounded-md">
                      <p className="text-xs text-slate-400">Employees</p>
                      <p className="text-sm font-bold text-slate-900">
                        {company.employeeCount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {company.hqCity && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.hqCity}, {company.hqState}
                      </span>
                    )}
                    {company.yearFounded && (
                      <span>Est. {company.yearFounded}</span>
                    )}
                  </div>
                  {companyDeals.length > 0 && (
                    <Badge variant="info" size="sm">
                      {companyDeals.length} deal{companyDeals.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <CompanyForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
