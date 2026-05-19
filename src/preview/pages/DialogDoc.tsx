import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../components/shadcn/dialog";
import { Button } from "../../components/ui/Button/button";
import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
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
  { id: "ex-form", label: "Form Dialog" },
  { id: "ex-confirmation", label: "Confirmation" },
  { id: "ex-scrollable", label: "Scrollable Content" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
];

export function DialogDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Feedback"
        title="Dialog"
        description="Modal overlay for focused interactions."
        dependency="@radix-ui/react-dialog"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="A basic dialog with a title, description, and footer actions."
        code={`<Dialog>
  <DialogTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-sm">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Please review before continuing.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button color="secondary" variant="ghost" size="sm">Cancel</Button>
      </DialogClose>
      <Button color="primary" variant="filled" size="sm">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              Open Dialog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Please review before continuing.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button color="secondary" variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button color="primary" variant="filled" size="sm">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ExampleSection>

      {/* Form Dialog */}
      <ExampleSection
        id="ex-form"
        title="Form Dialog"
        description="A dialog containing form fields for editing user profile information."
        code={`<Dialog>
  <DialogTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you are done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-gp-3xl py-sp-md">
      <div className="grid grid-cols-4 items-center gap-gp-3xl">
        <Label className="text-right">Name</Label>
        <Input className="col-span-3" placeholder="Enter your name" />
      </div>
      <div className="grid grid-cols-4 items-center gap-gp-3xl">
        <Label className="text-right">Username</Label>
        <Input className="col-span-3" placeholder="@username" />
      </div>
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button color="secondary" variant="ghost" size="sm">Cancel</Button>
      </DialogClose>
      <Button color="primary" variant="filled" size="sm">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you are done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-gp-3xl py-sp-md">
              <div className="grid grid-cols-4 items-center gap-gp-3xl">
                <Label className="text-right">Name</Label>
                <Input className="col-span-3" placeholder="Enter your name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-gp-3xl">
                <Label className="text-right">Username</Label>
                <Input className="col-span-3" placeholder="@username" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button color="secondary" variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button color="primary" variant="filled" size="sm">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ExampleSection>

      {/* Confirmation Dialog */}
      <ExampleSection
        id="ex-confirmation"
        title="Confirmation"
        description="A dialog prompting the user to confirm an action before proceeding."
        code={`<Dialog>
  <DialogTrigger asChild>
    <Button color="critical" variant="outline" size="sm">Delete Account</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-sm">
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your
        account and remove all associated data from our servers.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button color="secondary" variant="ghost" size="sm">Cancel</Button>
      </DialogClose>
      <Button color="critical" variant="filled" size="sm">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button color="critical" variant="outline" size="sm">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all associated data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button color="secondary" variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button color="critical" variant="filled" size="sm">
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ExampleSection>

      {/* Scrollable Content */}
      <ExampleSection
        id="ex-scrollable"
        title="Scrollable Content"
        description="A dialog with lengthy content that scrolls within a constrained area."
        code={`<Dialog>
  <DialogTrigger asChild>
    <Button color="secondary" variant="outline" size="sm">View License</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Software License Agreement</DialogTitle>
      <DialogDescription>
        Please read the following terms carefully before proceeding.
      </DialogDescription>
    </DialogHeader>
    <div className="max-h-[300px] overflow-y-auto pr-pad-md">
      <div className="flex flex-col gap-gp-3xl text-body-md text-fg-muted">
        <p>...</p>
      </div>
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button color="secondary" variant="ghost" size="sm">Decline</Button>
      </DialogClose>
      <Button color="primary" variant="filled" size="sm">Accept</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              View License
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Software License Agreement</DialogTitle>
              <DialogDescription>
                Please read the following terms carefully before proceeding.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[300px] overflow-y-auto pr-pad-md">
              <div className="flex flex-col gap-gp-3xl text-body-md text-fg-muted">
                <p>
                  This Software License Agreement ("Agreement") is entered into
                  as of the date of acceptance by the end user ("Licensee") and
                  governs the use of the software product provided herein. By
                  installing, copying, or otherwise using the software, the
                  Licensee agrees to be bound by the terms of this Agreement.
                </p>
                <p>
                  1. Grant of License. Subject to the terms and conditions of
                  this Agreement, the Licensor grants the Licensee a
                  non-exclusive, non-transferable, limited license to use the
                  software solely for internal business purposes. The Licensee
                  may install the software on any number of devices owned or
                  controlled by the Licensee within a single organization.
                </p>
                <p>
                  2. Restrictions. The Licensee shall not: (a) sublicense, sell,
                  lease, or otherwise distribute the software to any third party;
                  (b) modify, translate, adapt, or create derivative works based
                  on the software without prior written consent; (c) reverse
                  engineer, decompile, or disassemble the software except to the
                  extent permitted by applicable law.
                </p>
                <p>
                  3. Intellectual Property. The software and all copies thereof
                  are proprietary to the Licensor and title thereto remains in
                  the Licensor. All applicable rights to patents, copyrights,
                  trademarks, and trade secrets in the software are and shall
                  remain in the Licensor. The Licensee acknowledges that the
                  software and its structure, organization, and source code
                  constitute valuable trade secrets.
                </p>
                <p>
                  4. Termination. This Agreement is effective until terminated.
                  The Licensor may terminate this Agreement immediately upon
                  written notice if the Licensee breaches any provision of this
                  Agreement. Upon termination, the Licensee must destroy all
                  copies of the software in its possession and certify such
                  destruction in writing.
                </p>
                <p>
                  5. Disclaimer of Warranties. The software is provided "as is"
                  without warranty of any kind, express or implied, including but
                  not limited to the warranties of merchantability, fitness for a
                  particular purpose, and non-infringement. The Licensor does not
                  warrant that the software will be error-free or uninterrupted.
                </p>
                <p>
                  6. Limitation of Liability. In no event shall the Licensor be
                  liable for any indirect, incidental, special, consequential, or
                  punitive damages, regardless of the cause of action or the
                  theory of liability, even if the Licensor has been advised of
                  the possibility of such damages. The total liability of the
                  Licensor shall not exceed the fees paid by the Licensee for the
                  software.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button color="secondary" variant="ghost" size="sm">
                  Decline
                </Button>
              </DialogClose>
              <Button color="primary" variant="filled" size="sm">
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
