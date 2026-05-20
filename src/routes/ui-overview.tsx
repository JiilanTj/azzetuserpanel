import { useState } from "react";
import { createRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Label,
  Badge,
  Separator,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Checkbox,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Progress,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Alert,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableSkeleton,
  TablePagination,
} from "@/components/ui";
import {
  PersonIcon,
  MagnifyingGlassIcon,
  BellIcon,
  GearIcon,
  ExitIcon,
  DotsHorizontalIcon,
  DownloadIcon,
  Share1Icon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { authedLayout } from "./_authed";

export const uiOverviewRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/ui-overview",
  component: UIOverviewPage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <h2 className="text-lg font-semibold text-(--gray-12) mb-1">{title}</h2>
      <Separator className="mb-6" />
      {children}
    </section>
  );
}

type SortKey = "name" | "email" | "revenue" | "joined";
type SortDir = "asc" | "desc";

const MOCK_USERS = [
  {
    id: "1",
    name: "Sarah Chen",
    initials: "SC",
    email: "sarah@azzet.io",
    role: "Admin",
    status: "active",
    revenue: 48200,
    joined: "2023-01-12",
  },
  {
    id: "2",
    name: "Marco Rossi",
    initials: "MR",
    email: "marco@azzet.io",
    role: "Editor",
    status: "active",
    revenue: 31750,
    joined: "2023-03-08",
  },
  {
    id: "3",
    name: "Aisha Patel",
    initials: "AP",
    email: "aisha@azzet.io",
    role: "Viewer",
    status: "pending",
    revenue: 12400,
    joined: "2023-06-20",
  },
  {
    id: "4",
    name: "James Walker",
    initials: "JW",
    email: "james@azzet.io",
    role: "Editor",
    status: "inactive",
    revenue: 0,
    joined: "2022-11-30",
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    initials: "YT",
    email: "yuki@azzet.io",
    role: "Admin",
    status: "active",
    revenue: 67900,
    joined: "2022-09-15",
  },
  {
    id: "6",
    name: "Léa Dupont",
    initials: "LD",
    email: "lea@azzet.io",
    role: "Viewer",
    status: "active",
    revenue: 8300,
    joined: "2024-01-05",
  },
  {
    id: "7",
    name: "Carlos Mendez",
    initials: "CM",
    email: "carlos@azzet.io",
    role: "Editor",
    status: "pending",
    revenue: 22100,
    joined: "2023-08-19",
  },
] as const;

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "gray"> = {
  active: "success",
  pending: "warning",
  inactive: "error",
};

function UIOverviewPage() {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [switched, setSwitched] = useState(false);
  const [radio, setRadio] = useState("option-a");
  const [progress, setProgress] = useState(60);

  // Table state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [tableLoading, setTableLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const PAGE_SIZE = 4;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...MOCK_USERS].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "revenue") return (a.revenue - b.revenue) * dir;
    return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
  });

  const paginated = sorted.slice(
    (tablePage - 1) * PAGE_SIZE,
    tablePage * PAGE_SIZE,
  );

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds((prev) =>
      prev.size === paginated.length
        ? new Set()
        : new Set(paginated.map((u) => u.id)),
    );

  const sortDirFor = (key: SortKey) => (sortKey === key ? sortDir : false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Action completed!", {
        description: "Your request was processed.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-(--gray-12) font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-(--gray-6) bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-(--gray-10) hover:text-(--gray-12) transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <p className="text-sm font-semibold text-(--gray-12)">
              UI Overview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="soft">Radix UI</Badge>
            <Badge variant="success">Tailwind v4</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-(--gray-12) mb-2">
            Component Library
          </h1>
          <p className="text-(--gray-10)">
            Built with Radix UI primitives, Tailwind CSS v4, and Real Text font.
          </p>
        </div>

        {/* ---- BUTTONS ---- */}
        <Section title="Button">
          <p className="text-xs text-(--gray-9) font-medium mb-3 uppercase tracking-widest">
            Variants
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button variant="solid">Solid</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="surface">Surface</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>

          <p className="text-xs text-(--gray-9) font-medium mb-3 uppercase tracking-widest">
            Sizes
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button size="1">Size 1</Button>
            <Button size="2">Size 2</Button>
            <Button size="3">Size 3</Button>
            <Button size="4">Size 4</Button>
          </div>

          <p className="text-xs text-(--gray-9) font-medium mb-3 uppercase tracking-widest">
            States
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button onClick={simulateLoading} loading={loading}>
              {loading ? "Processing…" : "Click to Load"}
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
          </div>

          <p className="text-xs text-(--gray-9) font-medium mb-3 uppercase tracking-widest">
            With Icons
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button leftIcon={<PlusIcon />}>New Item</Button>
            <Button variant="outline" rightIcon={<DownloadIcon />}>
              Download
            </Button>
            <Button variant="ghost" leftIcon={<Share1Icon />}>
              Share
            </Button>
            <Button size="icon" variant="outline">
              <DotsHorizontalIcon />
            </Button>
            <Button size="icon-sm" variant="ghost">
              <BellIcon />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="destructive">
                  <TrashIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete item</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        {/* ---- CARD ---- */}
        <Section title="Card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>
                  Manage your workspace settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-(--gray-12)">
                      John Doe
                    </p>
                    <p className="text-xs text-(--gray-10)">john@azzet.io</p>
                  </div>
                  <Badge variant="soft" className="ml-auto">
                    Admin
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="2" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>
                  You are using {progress}% of your allocated storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Progress value={progress} />
                <div className="flex justify-between text-xs text-(--gray-10)">
                  <span>{(progress / 10).toFixed(1)} GB used</span>
                  <span>10 GB total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                  >
                    −
                  </Button>
                  <span className="text-sm font-medium text-(--gray-12) w-10 text-center">
                    {progress}%
                  </span>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ---- INPUTS ---- */}
        <Section title="Input & Textarea">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              leftIcon={<PersonIcon />}
            />
            <Input
              label="Search"
              placeholder="Search anything…"
              leftIcon={<MagnifyingGlassIcon />}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              hint="We'll never share your email."
            />
            <Input label="Password" type="password" placeholder="••••••••" />
            <Input
              label="Error State"
              placeholder="Invalid input"
              error
              errorMessage="This field is required."
            />
            <Input label="Disabled" placeholder="Cannot edit" disabled />
            <div className="flex flex-col gap-1.5">
              <Label>Custom Label</Label>
              <Input placeholder="Without built-in label" />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Notes"
                placeholder="Write something…"
                hint="Markdown supported."
              />
            </div>
          </div>
        </Section>

        {/* ---- BADGES ---- */}
        <Section title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge variant="solid">Solid</Badge>
            <Badge variant="soft">Soft</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="surface">Surface</Badge>
            <Badge variant="gray">Gray</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </Section>

        {/* ---- ALERT ---- */}
        <Section title="Alert">
          <div className="flex flex-col gap-3">
            <Alert variant="info" title="Info">
              Your account will be reviewed within 24 hours.
            </Alert>
            <Alert variant="success" title="Success">
              Your profile has been updated successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
              Your subscription expires in 3 days.
            </Alert>
            <Alert variant="error" title="Error">
              Failed to process your payment. Please try again.
            </Alert>
            <Alert variant="default" title="Note">
              This action cannot be undone.
            </Alert>
          </div>
        </Section>

        {/* ---- CHECKBOX / SWITCH / RADIO ---- */}
        <Section title="Checkbox, Switch & Radio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-(--gray-10) uppercase tracking-widest">
                Checkbox
              </p>
              <Checkbox
                label="Email notifications"
                hint="Receive updates via email"
                checked={checked}
                onCheckedChange={(v: boolean | "indeterminate") =>
                  setChecked(v === true)
                }
              />
              <Checkbox label="Checked" defaultChecked />
              <Checkbox label="Indeterminate" checked="indeterminate" />
              <Checkbox label="Disabled" disabled />
              <Checkbox label="Disabled checked" disabled defaultChecked />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-(--gray-10) uppercase tracking-widest">
                Switch
              </p>
              <Switch
                label="Dark Mode"
                hint="Toggle appearance"
                checked={switched}
                onCheckedChange={setSwitched}
              />
              <Switch label="Checked" defaultChecked />
              <Switch label="Disabled" disabled />
              <Switch label="Disabled On" disabled defaultChecked />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-(--gray-10) uppercase tracking-widest">
                Radio Group
              </p>
              <RadioGroup value={radio} onValueChange={setRadio}>
                <RadioGroupItem
                  value="option-a"
                  label="Option A"
                  hint="First option"
                />
                <RadioGroupItem value="option-b" label="Option B" />
                <RadioGroupItem value="option-c" label="Option C" />
                <RadioGroupItem value="option-d" label="Disabled" disabled />
              </RadioGroup>
            </div>
          </div>
        </Section>

        {/* ---- SELECT ---- */}
        <Section title="Select">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select>
              <SelectTrigger label="Country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Asia</SelectLabel>
                  <SelectItem value="id">🇮🇩 Indonesia</SelectItem>
                  <SelectItem value="sg">🇸🇬 Singapore</SelectItem>
                  <SelectItem value="jp">🇯🇵 Japan</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Europe</SelectLabel>
                  <SelectItem value="de">🇩🇪 Germany</SelectItem>
                  <SelectItem value="fr">🇫🇷 France</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger label="Disabled">
                <SelectValue placeholder="Cannot select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">Option</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        {/* ---- AVATAR ---- */}
        <Section title="Avatar">
          <div className="flex items-end gap-4">
            <Avatar size="sm">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <Avatar size="md">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <Avatar size="xl">
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        {/* ---- TABS ---- */}
        <Section title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="disabled" disabled>
                Disabled
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-(--gray-11)">
                    Overview content — build your dashboard metrics, charts, and
                    KPIs here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-(--gray-11)">
                    Analytics content — display charts and trends.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-(--gray-11)">
                    Settings content — manage configuration here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>

        {/* ---- ACCORDION ---- */}
        <Section title="Accordion">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Azzet OS?</AccordionTrigger>
              <AccordionContent>
                Azzet OS is a modern, multi-tenant B2B platform for managing
                enterprise workflows and financial operations at scale.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does billing work?</AccordionTrigger>
              <AccordionContent>
                Billing is handled on a per-seat or usage-based model, with
                invoices generated monthly and accessible in your billing
                dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I export my data?</AccordionTrigger>
              <AccordionContent>
                Yes. You can export all workspace data in CSV, JSON, or PDF
                formats from the Settings panel at any time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        {/* ---- OVERLAY COMPONENTS ---- */}
        <Section title="Overlay Components">
          <div className="flex flex-wrap gap-3">
            {/* Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Action</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this item? This action
                    cannot be undone and all associated data will be permanently
                    removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => toast.error("Item deleted")}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent showClose>
                <p className="text-sm font-medium text-(--gray-12) mb-1">
                  Quick Actions
                </p>
                <p className="text-xs text-(--gray-10) mb-3">
                  Select an action to perform on the selected item.
                </p>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="2"
                    className="justify-start"
                    leftIcon={<DownloadIcon />}
                  >
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="2"
                    className="justify-start"
                    leftIcon={<Share1Icon />}
                  >
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="2"
                    className="justify-start text-red-600 hover:text-red-700"
                    leftIcon={<TrashIcon />}
                  >
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" rightIcon={<DotsHorizontalIcon />}>
                  Dropdown
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PersonIcon className="h-4 w-4" />
                  Profile<DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellIcon className="h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GearIcon className="h-4 w-4" />
                  Settings<DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive>
                  <ExitIcon className="h-4 w-4" />
                  Log out<DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <BellIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">View notifications</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        {/* ---- TOAST ---- */}
        <Section title="Toast (Sonner)">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="solid"
              onClick={() =>
                toast.success("Success!", {
                  description: "Operation was successful.",
                })
              }
            >
              Success Toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.error("Error!", { description: "Something went wrong." })
              }
            >
              Error Toast
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                toast.warning("Warning", { description: "Please review this." })
              }
            >
              Warning Toast
            </Button>
            <Button
              variant="soft"
              onClick={() =>
                toast.info("Info", { description: "Here is some info." })
              }
            >
              Info Toast
            </Button>
            <Button variant="surface" onClick={() => toast.loading("Loading…")}>
              Loading Toast
            </Button>
          </div>
        </Section>

        {/* ---- TABLE ---- */}
        <Section title="Table">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Badge variant="soft">{selectedIds.size} selected</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="1"
                variant="ghost"
                onClick={() => {
                  setTableLoading(true);
                  setTimeout(() => setTableLoading(false), 2000);
                }}
              >
                Simulate Loading
              </Button>
              <Button
                size="1"
                variant="ghost"
                onClick={() => setShowEmpty((e) => !e)}
              >
                Toggle Empty
              </Button>
            </div>
          </div>

          {/* Default table */}
          <Table stickyHeader>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      selectedIds.size === paginated.length &&
                      paginated.length > 0
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead
                  sortable
                  sortDir={sortDirFor("name")}
                  onSort={() => handleSort("name")}
                >
                  User
                </TableHead>
                <TableHead
                  sortable
                  sortDir={sortDirFor("email")}
                  onSort={() => handleSort("email")}
                >
                  Email
                </TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  sortable
                  sortDir={sortDirFor("revenue")}
                  onSort={() => handleSort("revenue")}
                  numeric
                >
                  Revenue
                </TableHead>
                <TableHead
                  sortable
                  sortDir={sortDirFor("joined")}
                  onSort={() => handleSort("joined")}
                >
                  Joined
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableLoading ? (
                <TableSkeleton cols={8} rows={4} />
              ) : showEmpty ? (
                <TableEmpty
                  colSpan={8}
                  message="No users found"
                  description="Try adjusting your filters or invite new team members."
                />
              ) : (
                paginated.map((user) => (
                  <TableRow
                    key={user.id}
                    selected={selectedIds.has(user.id)}
                    clickable
                    onClick={() => toggleRow(user.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleRow(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell muted>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="gray">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[user.status]}>
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell numeric>
                      {user.revenue > 0 ? (
                        `$${user.revenue.toLocaleString()}`
                      ) : (
                        <span className="text-(--gray-9)">—</span>
                      )}
                    </TableCell>
                    <TableCell muted>
                      {new Date(user.joined).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon-sm" variant="ghost">
                            <DotsHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <PersonIcon className="h-4 w-4" />
                            View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <GearIcon className="h-4 w-4" />
                            Edit user
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive>
                            <TrashIcon className="h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-xs text-(--gray-10)">
                  Total ({MOCK_USERS.length} users)
                </TableCell>
                <TableCell numeric className="font-semibold">
                  $
                  {MOCK_USERS.reduce(
                    (s, u) => s + u.revenue,
                    0,
                  ).toLocaleString()}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
          <TablePagination
            page={tablePage}
            pageSize={PAGE_SIZE}
            total={MOCK_USERS.length}
            onPageChange={setTablePage}
          />

          {/* Striped + Compact variant */}
          <p className="text-xs text-(--gray-9) font-medium mt-8 mb-3 uppercase tracking-widest">
            Striped + Compact
          </p>
          <Table striped compact>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead numeric>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell muted>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[user.status]}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell numeric>
                    {user.revenue > 0
                      ? `$${user.revenue.toLocaleString()}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      </main>
    </div>
  );
}
