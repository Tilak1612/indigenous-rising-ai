import { useId, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AMOUNT_BANDS, APPLICANT_LABELS, CATEGORY_LABELS, DEADLINE_OPTIONS, FUNDING_TYPE_LABELS, IDENTITY_LABELS,
  INDUSTRIES, PROVINCES, STAGE_LABELS, activeFilterCount, type FilterState,
} from '@/lib/funding-catalog';

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** Hide a group when the page already fixes it (region pages fix the province). */
  lock?: Partial<Record<'provinces' | 'types', true>>;
}

function Group({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border py-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-sm font-medium text-foreground">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-1.5">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function CheckList({ options, selected, onToggle }: { options: Array<{ value: string; label: string }>; selected: string[]; onToggle: (v: string) => void }) {
  const id = useId();
  return (
    <ul className="space-y-1.5">
      {options.map((o) => (
        <li key={o.value} className="flex items-center gap-2">
          <Checkbox id={`${id}-${o.value}`} checked={selected.includes(o.value)} onCheckedChange={() => onToggle(o.value)} />
          <label htmlFor={`${id}-${o.value}`} className="text-sm leading-tight cursor-pointer">{o.label}</label>
        </li>
      ))}
    </ul>
  );
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function FundingFiltersPanel({ value, onChange, lock = {} }: Props) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch, page: 1 });
  const count = activeFilterCount(value);
  const qId = useId();
  return (
    <aside aria-label="Filter funding programmes" className="space-y-3">
      <div>
        <label htmlFor={qId} className="sr-only">Search programmes</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={qId} value={value.q} onChange={(e) => set({ q: e.target.value.slice(0, 120) })} placeholder="Search by name, funder or keyword" className="pl-9" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{count ? `${count} filter${count === 1 ? '' : 's'} active` : 'No filters active'}</p>
        {count > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...value, q: '', provinces: lock.provinces ? value.provinces : [], types: lock.types ? value.types : [], stages: [], sectors: [], applicants: [], identities: [], categories: [], amount: null, deadline: null, verifiedOnly: false, acceptingOnly: false, page: 1 })}>
            <X className="w-3.5 h-3.5 mr-1" aria-hidden="true" />Clear
          </Button>
        )}
      </div>
      <div className="space-y-1.5 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Checkbox id={`${qId}-acc`} checked={value.acceptingOnly} onCheckedChange={(c) => set({ acceptingOnly: c === true })} />
          <label htmlFor={`${qId}-acc`} className="text-sm cursor-pointer">Currently accepting applications</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id={`${qId}-ver`} checked={value.verifiedOnly} onCheckedChange={(c) => set({ verifiedOnly: c === true })} />
          <label htmlFor={`${qId}-ver`} className="text-sm cursor-pointer">Verified against the funder only</label>
        </div>
      </div>
      {!lock.provinces && (
        <Group title="Province or territory" defaultOpen>
          <CheckList options={PROVINCES.map((p) => ({ value: p.code, label: p.name }))} selected={value.provinces} onToggle={(v) => set({ provinces: toggle(value.provinces, v) })} />
          <p className="text-xs text-muted-foreground pt-1">National programmes appear for every province.</p>
        </Group>
      )}
      {!lock.types && (
        <Group title="Funding type" defaultOpen>
          <CheckList options={Object.entries(FUNDING_TYPE_LABELS).map(([value, label]) => ({ value, label }))} selected={value.types} onToggle={(v) => set({ types: toggle(value.types, v) })} />
        </Group>
      )}
      <Group title="Who is applying">
        <CheckList options={Object.entries(APPLICANT_LABELS).map(([value, label]) => ({ value, label }))} selected={value.applicants} onToggle={(v) => set({ applicants: toggle(value.applicants, v) })} />
      </Group>
      <Group title="Eligibility by identity">
        <CheckList options={Object.entries(IDENTITY_LABELS).map(([value, label]) => ({ value, label }))} selected={value.identities} onToggle={(v) => set({ identities: toggle(value.identities, v) })} />
        <p className="text-xs text-muted-foreground pt-1">Programmes open to all Indigenous applicants are always included.</p>
      </Group>
      <Group title="Business stage">
        <CheckList options={Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }))} selected={value.stages} onToggle={(v) => set({ stages: toggle(value.stages, v) })} />
      </Group>
      <Group title="Funding purpose">
        <CheckList options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))} selected={value.categories} onToggle={(v) => set({ categories: toggle(value.categories, v) })} />
      </Group>
      <Group title="Sector">
        <CheckList options={INDUSTRIES.map((i) => ({ value: i, label: i }))} selected={value.sectors} onToggle={(v) => set({ sectors: toggle(value.sectors, v) })} />
      </Group>
      <Group title="Amount">
        <CheckList options={AMOUNT_BANDS.map((b) => ({ value: b.value, label: b.label }))} selected={value.amount ? [value.amount] : []} onToggle={(v) => set({ amount: value.amount === v ? null : (v as FilterState['amount']) })} />
        <p className="text-xs text-muted-foreground pt-1">Only programmes that publish an amount can match an amount filter.</p>
      </Group>
      <Group title="Deadline">
        <CheckList options={DEADLINE_OPTIONS.map((d) => ({ value: d.value, label: d.label }))} selected={value.deadline ? [value.deadline] : []} onToggle={(v) => set({ deadline: value.deadline === v ? null : (v as FilterState['deadline']) })} />
      </Group>
    </aside>
  );
}
