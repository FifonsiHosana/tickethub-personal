// import { useState, useEffect } from "react";
// import { Loader2Icon, PlusIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { useTicketTypes, useCreateTicketType } from "@/hooks/organizers/useOrganizerEventTickets";
// import type { TicketResponse } from "@/utils/services/organizers/tickets.service";
// import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";

// interface TicketConfigSheetProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   mode: "create" | "edit";
//   event: OrganizerEventResponse | null;
//   ticket?: TicketResponse | null;
//   onSave: (data: Record<string, unknown>) => Promise<void>;
// }

// export function TicketConfigSheet({
//   open,
//   onOpenChange,
//   mode,
//   event,
//   ticket,
//   onSave,
// }: TicketConfigSheetProps) {
//   const { data: existingTypes } = useTicketTypes();
//   const createTypeMutation = useCreateTicketType();

//   const [name, setName] = useState("");
//   const [selectedTypeId, setSelectedTypeId] = useState<string>("");
//   const [showNewTypeFields, setShowNewTypeFields] = useState(false);
//   const [newTypeName, setNewTypeName] = useState("");
//   const [newTypeDesc, setNewTypeDesc] = useState("");
//   const [price, setPrice] = useState("");
//   const [totalCount, setTotalCount] = useState("");
//   const [salesStart, setSalesStart] = useState("");
//   const [salesEnd, setSalesEnd] = useState("");
//   const [benefits, setBenefits] = useState("");
//   const [saving, setSaving] = useState(false);

//   const isCreate = mode === "create";

//   // Reset form when sheet opens
//   useEffect(() => {
//     if (open) {
//       if (isCreate) {
//         setName("");
//         setSelectedTypeId("");
//         setShowNewTypeFields(false);
//         setNewTypeName("");
//         setNewTypeDesc("");
//         setPrice("");
//         setTotalCount(event?.capacity?.toString() ?? "");
//         setSalesStart(event?.dateAndTime ?? "");
//         setSalesEnd(event?.dateAndTime ?? "");
//         setBenefits("");
//       } else if (ticket) {
//         setName(ticket.name);
//         setSelectedTypeId(ticket.ticketTypeId?.toString() ?? "");
//         setShowNewTypeFields(false);
//         setPrice(ticket.price);
//         setTotalCount(ticket.totalCount.toString());
//         setSalesStart(ticket.salesStartDate ?? "");
//         setSalesEnd(ticket.salesEndDate ?? "");
//         setBenefits(ticket.benefits ?? "");
//       }
//     }
//   }, [open, mode, ticket, event,]);

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const data: Record<string, unknown> = {};

//       if (isCreate) {
//         data.name = name;

//         if (showNewTypeFields && newTypeName) {
//           data.ticketTypeName = newTypeName;
//           data.ticketTypeDescription = newTypeDesc || undefined;
//         } else {
//           data.ticketTypeId = Number(selectedTypeId);
//         }
//       } else {
//         if (name !== ticket?.name) data.name = name;
//       }

//       data.price = Number(price);

//       if (totalCount) {
//         data.totalCount = Number(totalCount);
//       }

//       if (salesStart) data.salesStartDate = salesStart;
//       if (salesEnd) data.salesEndDate = salesEnd;
//       if (benefits) data.benefits = benefits;

//       await onSave(data);
//       onOpenChange(false);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSelectType = (value: string) => {
//     if (value === "__new__") {
//       setShowNewTypeFields(true);
//       setSelectedTypeId("");
//     } else {
//       setShowNewTypeFields(false);
//       setSelectedTypeId(value);
//     }
//   };

//   const handleCreateAndSelectType = async () => {
//     if (!newTypeName.trim()) return;
//     try {
//       const created = await createTypeMutation.mutateAsync({
//         name: newTypeName,
//         description: newTypeDesc || undefined,
//       });
//       setSelectedTypeId(created.id.toString());
//       setShowNewTypeFields(false);
//       setNewTypeName("");
//       setNewTypeDesc("");
//     } catch {
//       // error handled by mutation
//     }
//   };

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
//         <SheetHeader>
//           <SheetTitle>
//             {isCreate ? "Create Ticket" : "Edit Ticket Configuration"}
//           </SheetTitle>
//           <SheetDescription>
//             {isCreate
//               ? `Adding a new ticket for ${event?.title ?? "event"}`
//               : `Updating ${ticket?.name ?? "ticket"}`}
//           </SheetDescription>
//         </SheetHeader>

//         <div className="space-y-5 py-6">
//           {isCreate && (
//             <div className="space-y-2">
//               <Label htmlFor="ticket-name">Ticket Name</Label>
//               <Input
//                 id="ticket-name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="e.g. Early Bird"
//               />
//             </div>
//           )}

//           {isCreate && (
//             <div className="space-y-2">
//               <Label>Ticket Type</Label>
//               {!showNewTypeFields ? (
//                 <div className="flex gap-2 w-full">
//                   <div className="flex-1">
//                     <Select value={selectedTypeId} onValueChange={handleSelectType}>
//                       <SelectTrigger className="w-full bg-white">
//                         <SelectValue placeholder="Select a type..." />
//                       </SelectTrigger>
//                       <SelectContent className="bg-white">
//                         {existingTypes?.map((t) => (
//                           <SelectItem key={t.id} value={t.id.toString()}>
//                             {t.name}
//                           </SelectItem>
//                         ))}
//                         <SelectItem value="__new__">
//                           <span className="flex items-center gap-2 text-primary">
//                             <PlusIcon className="h-3.5 w-3.5" />
//                             Create New Type...
//                           </span>
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-3 rounded-lg border p-3 bg-neutral-50">
//                   <Input
//                     placeholder="New type name..."
//                     value={newTypeName}
//                     onChange={(e) => setNewTypeName(e.target.value)}
//                   />
//                   <Input
//                     placeholder="Description (optional)"
//                     value={newTypeDesc}
//                     onChange={(e) => setNewTypeDesc(e.target.value)}
//                   />
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       onClick={handleCreateAndSelectType}
//                       disabled={!newTypeName.trim() || createTypeMutation.isPending}
//                     >
//                       {createTypeMutation.isPending ? "Creating..." : "Create & Select"}
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => setShowNewTypeFields(false)}
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="price">Price (GH₵)</Label>
//             <Input
//               id="price"
//               type="number"
//               step="0.01"
//               min="0"
//               value={price}
//               onChange={(e) => setPrice(e.target.value)}
//               placeholder="0.00"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="total-count">
//               Total Quantity
//             </Label>
//             <Input
//               id="total-count"
//               type="number"
//               min="1"
//               value={totalCount}
//               onChange={(e) => setTotalCount(e.target.value)}
//             />
//             {event && (
//               <p className="text-xs text-muted-foreground">
//                 Event capacity: {event.capacity.toLocaleString()}
//               </p>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="sales-start">Sales Start</Label>
//               <Input
//                 id="sales-start"
//                 type="datetime-local"
//                 value={salesStart}
//                 onChange={(e) => setSalesStart(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="sales-end">Sales End</Label>
//               <Input
//                 id="sales-end"
//                 type="datetime-local"
//                 value={salesEnd}
//                 onChange={(e) => setSalesEnd(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="benefits">Benefits (optional)</Label>
//             <Textarea
//               id="benefits"
//               value={benefits}
//               onChange={(e) => setBenefits(e.target.value)}
//               placeholder="e.g. Free drink, early entry, merch discount"
//               rows={3}
//             />
//           </div>
//         </div>

//         <SheetFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave} disabled={saving}>
//             {saving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
//             {isCreate ? "Create Ticket" : "Save Changes"}
//           </Button>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   );
// }
