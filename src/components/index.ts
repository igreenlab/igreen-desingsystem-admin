export { Avatar } from "./ui/Avatar";
export { avatarVariants, type AvatarVariantProps } from "./ui/Avatar";
export type { AvatarProps } from "./ui/Avatar";

export { Button } from "./ui/Button";
export type { ButtonProps } from "./ui/Button";

// Shadcn components (adapted with iGreen tokens)
export { Badge, badgeVariants } from "./shadcn";
export type { BadgeProps } from "./shadcn";
export { Input, inputVariants } from "./shadcn";
export type { InputProps } from "./shadcn";

export {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from "./shadcn";
export type {
  InputGroupProps,
  InputGroupInputProps,
  InputGroupTextareaProps,
  InputGroupAddonProps,
  InputGroupAddonAlign,
  InputGroupTextProps,
  InputGroupButtonProps,
  InputGroupState,
} from "./shadcn";

// AlertModal — wrapper alto nível pra AlertDialog
export { AlertModal } from "./ui/AlertModal";
export type { AlertModalProps, AlertModalTone } from "./ui/AlertModal";

// FormField composition wrappers (label + field + helper/error)
export {
  FormField,
  FormFieldInput,
  FormFieldTextarea,
  FormFieldSelect,
  FormFieldCheckbox,
  FormFieldSwitch,
} from "./ui/FormField";
export type {
  FormFieldProps,
  FormFieldInputProps,
  FormFieldTextareaProps,
  FormFieldSelectProps,
  FormFieldSelectOption,
  FormFieldCheckboxProps,
  FormFieldSwitchProps,
  FieldState,
  FormFieldBaseProps,
} from "./ui/FormField";

export * from "./ui/Table";
export * from "./ui/DataTable";
