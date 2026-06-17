/**
 * Exemplo distribuível — Edit Page (tela de edição com formulário).
 * Puxe: npm run igreen:add -- example-edit-page   (traz form-field + card + page-header + button)
 * Renderize <EditPageScreen />. Referência pra telas de edição/cadastro.
 */
import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  FormFieldSwitch,
} from "@/components/ui/FormField";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/shadcn/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export function EditPageScreen() {
  return (
    <div className="min-h-screen bg-bg-canvas p-sp-xl flex flex-col gap-gp-lg">
      <PageHeader
        title="Editar cliente"
        description="Exemplo @igreen/example-edit-page — formulário com FormField (label/erro/helper)."
        actions={
          <div className="flex gap-gp-sm">
            <Button color="secondary" variant="outline">Cancelar</Button>
            <Button color="primary" variant="filled">Salvar</Button>
          </div>
        }
      />
      <Card className="w-full max-w-container-md">
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
          <CardDescription>Campos obrigatórios marcados. Validação inline via FormField.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-form-gap">
          <FormFieldInput label="Nome" placeholder="Sergio Vieira" defaultValue="Sergio Vieira" required />
          <FormFieldInput
            label="E-mail"
            placeholder="email@empresa.com"
            defaultValue="email@invalido"
            errorMessage="E-mail inválido."
          />
          <FormFieldSelect
            label="Plano"
            placeholder="Selecione"
            options={[
              { value: "mensal", label: "Mensal" },
              { value: "anual", label: "Anual" },
              { value: "trienal", label: "Trienal" },
            ]}
          />
          <FormFieldTextarea label="Observações" placeholder="Notas internas..." helperText="Visível só pra equipe." />
          <FormFieldSwitch label="Cliente ativo" defaultChecked />
        </CardContent>
        <CardFooter className="justify-end gap-gp-sm">
          <Button color="secondary" variant="outline">Cancelar</Button>
          <Button color="primary" variant="filled">Salvar alterações</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default EditPageScreen;
