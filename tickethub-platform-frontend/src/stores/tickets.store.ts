// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";

// export interface SelectedTicket {
//   eventTicketId: number;
//   ticketName: string;
//   ticketType: string;
//   price: number;
//   quantity: number;
//   eventName: string;
//   banner: string;
// }

// interface TicketCartStore {
//   items: SelectedTicket[];
//   addTicket: (ticket: Omit<SelectedTicket, "quantity">) => void;
//   removeTicket: (eventTicketId: number) => void;
//   increaseQuantity: (eventTicketId: number) => void;
//   decreaseQuantity: (eventTicketId: number) => void;
//   clearCart: () => void;
//   totalQuantity: () => void;
//   totalAmount: () => void;
//   totalTicketQuantity: number;
//   totalTicketAmount: number;
// }

// export const useTicketCartStore = create<TicketCartStore>()(
//   persist(
//     (set) => ({
//       items: [],
//       totalTicketQuantity: 0,
//       totalTicketAmount: 0,

//       addTicket: (ticket) => {
//         set((state) => {
//           const existing = state.items.find(
//             (item) => item.eventTicketId === ticket.eventTicketId,
//           );

//           if (existing) {
//             return {
//               items: state.items.map((item) =>
//                 item.eventTicketId === ticket.eventTicketId
//                   ? {
//                       ...item,
//                       quantity: item.quantity + 1,
//                     }
//                   : item,
//               ),
//             };
//           }

//           return {
//             items: [
//               ...state.items,
//               {
//                 ...ticket,
//                 quantity: 1,
//               },
//             ],
//           };
//         });
//       },

//       removeTicket: (eventTicketId) =>
//         set((state) => ({
//           items: state.items.filter(
//             (item) => item.eventTicketId !== eventTicketId,
//           ),
//         })),

//       increaseQuantity: (eventTicketId) =>
//         set((state) => ({
//           items: state.items.map((item) =>
//             item.eventTicketId === eventTicketId
//               ? {
//                   ...item,
//                   quantity: item.quantity + 1,
//                 }
//               : item,
//           ),
//         })),

//       decreaseQuantity: (eventTicketId) =>
//         set((state) => ({
//           items: state.items
//             .map((item) =>
//               item.eventTicketId === eventTicketId
//                 ? {
//                     ...item,
//                     quantity: item.quantity - 1,
//                   }
//                 : item,
//             )
//             .filter((item) => item.quantity > 0),
//         })),

//       clearCart: () =>
//         set({
//           items: [],
//         }),

//       totalQuantity: () =>
//         set((state) => ({
//           totalTicketQuantity: state.items.reduce(
//             (sum, item) => sum + Number(item.quantity),
//             0,
//           ),

//         })),

//       totalAmount: () =>
//         set((state) => ({
//           totalTicketAmount: state.items.reduce(
//             (sum, item) => sum + Number(item.price) * Number(item.quantity),
//             0,
//           ),
//         })),
//     }),
//     {
//       name: "ticket-cart-storage",
//       storage: createJSONStorage(() => localStorage),
//     },
//   ),
// );

// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";

// export interface SelectedTicket {
//   eventTicketId: number;
//   ticketName: string;
//   ticketType: string;
//   price: number;
//   quantity: number;
//   eventName: string;
//   banner: string;
// }

// interface TicketCartStore {
//   items: SelectedTicket[];

//   addTicket: (ticket: Omit<SelectedTicket, "quantity">) => void;
//   removeTicket: (eventTicketId: number) => void;
//   increaseQuantity: (eventTicketId: number) => void;
//   decreaseQuantity: (eventTicketId: number) => void;
//   clearCart: () => void;

//   totalQuantity: () => number;
//   totalAmount: () => number;
// }

// export const useTicketCartStore = create<TicketCartStore>()(
//   persist(
//     (set, get) => ({
//       items: [],

//       addTicket: (ticket) => {
//         set((state) => {
//           const existing = state.items.find(
//             (item) => item.eventTicketId === ticket.eventTicketId,
//           );

//           if (existing) {
//             return {
//               items: state.items.map((item) =>
//                 item.eventTicketId === ticket.eventTicketId
//                   ? {
//                       ...item,
//                       quantity: item.quantity + 1,
//                     }
//                   : item,
//               ),
//             };
//           }

//           return {
//             items: [
//               ...state.items,
//               {
//                 ...ticket,
//                 quantity: 1,
//               },
//             ],
//           };
//         });
//       },

//       removeTicket: (eventTicketId) =>
//         set((state) => ({
//           items: state.items.filter(
//             (item) => item.eventTicketId !== eventTicketId,
//           ),
//         })),

//       increaseQuantity: (eventTicketId) =>
//         set((state) => ({
//           items: state.items.map((item) =>
//             item.eventTicketId === eventTicketId
//               ? {
//                   ...item,
//                   quantity: item.quantity + 1,
//                 }
//               : item,
//           ),
//         })),

//       decreaseQuantity: (eventTicketId) =>
//         set((state) => ({
//           items: state.items
//             .map((item) =>
//               item.eventTicketId === eventTicketId
//                 ? {
//                     ...item,
//                     quantity: item.quantity - 1,
//                   }
//                 : item,
//             )
//             .filter((item) => item.quantity > 0),
//         })),

//       clearCart: () =>
//         set({
//           items: [],
//         }),

//       totalQuantity: () => {
//         return get().items.reduce(
//           (sum, item) => sum + Number(item.quantity),
//           0,
//         );
//       },

//       totalAmount: () => {
//         return get().items.reduce(
//           (sum, item) => sum + Number(item.price) * Number(item.quantity),
//           0,
//         );
//       },
//     }),
//     {
//       name: "ticket-cart-storage",
//       storage: createJSONStorage(() => localStorage),
//     },
//   ),
// );

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SelectedTicket {
  eventTicketId: number;
  ticketName: string;
  ticketType: string;
  price: number;
  quantity: number;
  eventName: string;
  banner: string;
}

interface TicketCartStore {
  items: SelectedTicket[];

  totalTicketQuantity: number;
  totalTicketAmount: number;

  addTicket: (ticket: Omit<SelectedTicket, "quantity">) => void;
  removeTicket: (eventTicketId: number) => void;
  increaseQuantity: (eventTicketId: number) => void;
  decreaseQuantity: (eventTicketId: number) => void;
  clearCart: () => void;
}

export const useTicketCartStore = create<TicketCartStore>()(
  persist(
    (set) => ({
      items: [],

      totalTicketQuantity: 0,
      totalTicketAmount: 0,

      addTicket: (ticket) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.eventTicketId === ticket.eventTicketId,
          );

          const items = existing
            ? state.items.map((item) =>
                item.eventTicketId === ticket.eventTicketId
                  ? {
                      ...item,
                      quantity: item.quantity + 1,
                    }
                  : item,
              )
            : [
                ...state.items,
                {
                  ...ticket,
                  quantity: 1,
                },
              ];

          return {
            items,
            totalTicketQuantity: items.reduce(
              (sum, item) => sum + Number(item.quantity),
              0,
            ),
            totalTicketAmount: items.reduce(
              (sum, item) => sum + Number(item.price) * Number(item.quantity),
              0,
            ),
          };
        });
      },

      removeTicket: (eventTicketId) => {
        set((state) => {
          const items = state.items.filter(
            (item) => item.eventTicketId !== eventTicketId,
          );

          return {
            items,
            totalTicketQuantity: items.reduce(
              (sum, item) => sum + Number(item.quantity),
              0,
            ),
            totalTicketAmount: items.reduce(
              (sum, item) => sum + Number(item.price) * Number(item.quantity),
              0,
            ),
          };
        });
      },

      increaseQuantity: (eventTicketId) => {
        set((state) => {
          const items = state.items.map((item) =>
            item.eventTicketId === eventTicketId
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          );

          return {
            items,
            totalTicketQuantity: items.reduce(
              (sum, item) => sum + Number(item.quantity),
              0,
            ),
            totalTicketAmount: items.reduce(
              (sum, item) => sum + Number(item.price) * Number(item.quantity),
              0,
            ),
          };
        });
      },

      decreaseQuantity: (eventTicketId) => {
        set((state) => {
          const items = state.items
            .map((item) =>
              item.eventTicketId === eventTicketId
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item,
            )
            .filter((item) => item.quantity > 0);

          return {
            items,
            totalTicketQuantity: items.reduce(
              (sum, item) => sum + Number(item.quantity),
              0,
            ),
            totalTicketAmount: items.reduce(
              (sum, item) => sum + Number(item.price) * Number(item.quantity),
              0,
            ),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalTicketQuantity: 0,
          totalTicketAmount: 0,
        });
      },
    }),
    {
      name: "ticket-cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);