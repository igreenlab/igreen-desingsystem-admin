import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "../../components/shadcn/dropdown-menu";
import { Button } from "../../components/ui/Button/button";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  MessageSquare,
  Plus,
} from "lucide-react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
  getDocNav,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-shortcuts", label: "With Shortcuts" },
  { id: "ex-icons", label: "With Icons" },
  { id: "ex-checkboxes", label: "Checkboxes" },
  { id: "ex-radio", label: "Radio Group" },
  { id: "ex-submenu", label: "Submenu" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
];

function CheckboxExample() {
  const [showStatusbar, setShowStatusbar] = useState(true);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button color="secondary" variant="outline" size="sm">
          View <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatusbar}
          onCheckedChange={setShowStatusbar}
        >
          Show Statusbar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showToolbar}
          onCheckedChange={setShowToolbar}
        >
          Show Toolbar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          Show Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RadioExample() {
  const [theme, setTheme] = useState("system");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button color="secondary" variant="outline" size="sm">
          Theme <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DropdownMenuDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Navigation"
        title="Dropdown Menu"
        description="Contextual menu with glassmorphism backdrop."
        dependency="@radix-ui/react-dropdown-menu"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="A basic dropdown menu with labeled groups and separators."
        code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">
      Menu <ChevronDown className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              Menu <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ExampleSection>

      {/* With Shortcuts */}
      <ExampleSection
        id="ex-shortcuts"
        title="With Shortcuts"
        description="Menu items displaying keyboard shortcut hints on the right side."
        code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">
      Actions <ChevronDown className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuGroup>
      <DropdownMenuItem>
        Profile <DropdownMenuShortcut>\u21e7\u2318P</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Settings <DropdownMenuShortcut>\u2318S</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      Sign out <DropdownMenuShortcut>\u21e7\u2318Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              Actions <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile <DropdownMenuShortcut>{"\u21e7\u2318P"}</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings <DropdownMenuShortcut>{"\u2318S"}</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Sign out <DropdownMenuShortcut>{"\u21e7\u2318Q"}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ExampleSection>

      {/* With Icons */}
      <ExampleSection
        id="ex-icons"
        title="With Icons"
        description="Menu items with leading icons for visual context."
        code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">
      Account <ChevronDown className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="size-4" /> Profile
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="size-4" /> Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut className="size-4" /> Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              Account <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ExampleSection>

      {/* Checkboxes */}
      <ExampleSection
        id="ex-checkboxes"
        title="Checkboxes"
        description="Checkbox items for toggling independent options within the menu."
        code={`const [showStatusbar, setShowStatusbar] = useState(true);
const [showToolbar, setShowToolbar] = useState(false);
const [showPanel, setShowPanel] = useState(false);

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">
      View <ChevronDown className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem
      checked={showStatusbar}
      onCheckedChange={setShowStatusbar}
    >
      Show Statusbar
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem
      checked={showToolbar}
      onCheckedChange={setShowToolbar}
    >
      Show Toolbar
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem
      checked={showPanel}
      onCheckedChange={setShowPanel}
    >
      Show Panel
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <CheckboxExample />
      </ExampleSection>

      {/* Radio Group */}
      <ExampleSection
        id="ex-radio"
        title="Radio Group"
        description="Radio items for selecting a single option from a group of choices."
        code={`const [theme, setTheme] = useState("system");

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">
      Theme <ChevronDown className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <RadioExample />
      </ExampleSection>

      {/* Submenu */}
      <ExampleSection
        id="ex-submenu"
        title="Submenu"
        description="Nested submenus for organizing related actions in a hierarchy."
        code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">
      Options <ChevronDown className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <User className="size-4" /> Profile
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings className="size-4" /> Settings
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Plus className="size-4" /> Invite team
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>
          <Mail className="size-4" /> Email
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare className="size-4" /> Message
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>More options</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut className="size-4" /> Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              Options <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Plus className="size-4" /> Invite team
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Mail className="size-4" /> Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="size-4" /> Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More options</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
