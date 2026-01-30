export const getDefaultCategories = () => {
  return [
    { "name": "Cleaning" },
    { "name": "Kitchen" },
    { "name": "Bathroom" },
    { "name": "Bedroom" },
    { "name": "Living Room" },
    { "name": "Laundry" },
    { "name": "Pets" },
    { "name": "Groceries & Errands" },
    { "name": "Maintenance" },
    { "name": "Outdoors" }
  ]
};

export const getDefaultChores = () => {
  return [
    {
      "name": "Vacuum floors",
      "categoryName": "Cleaning",
      "categoryId": "__CLEANING_ID__",
      "points": 3
    },
    {
      "name": "Mop floors",
      "categoryName": "Cleaning",
      "categoryId": "__CLEANING_ID__",
      "points": 3
    },
    {
      "name": "Dust surfaces",
      "categoryName": "Cleaning",
      "categoryId": "__CLEANING_ID__",
      "points": 2
    },
    {
      "name": "Clean windows",
      "categoryName": "Cleaning",
      "categoryId": "__CLEANING_ID__",
      "points": 4
    },
    {
      "name": "Wipe countertops",
      "categoryName": "Cleaning",
      "categoryId": "__CLEANING_ID__",
      "points": 1
    },
    {
      "name": "Take out trash",
      "categoryName": "Cleaning",
      "categoryId": "__CLEANING_ID__",
      "points": 1
    },
    {
      "name": "Clean fridge exterior",
      "categoryName": "Cleaning",
      "categoryId": "__CLEANING_ID__",
      "points": 2
    },

    {
      "name": "Wash dishes",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 2
    },
    {
      "name": "Load/unload dishwasher",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 1
    },
    {
      "name": "Clean stovetop",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 2
    },
    {
      "name": "Clean oven",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 4
    },
    {
      "name": "Clean microwave",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 2
    },
    {
      "name": "Wipe kitchen table",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 1
    },
    {
      "name": "Empty kitchen trash",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 1
    },
    {
      "name": "Organize pantry",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 3
    },
    {
      "name": "Empty recycling",
      "categoryName": "Kitchen",
      "categoryId": "__KITCHEN_ID__",
      "points": 2
    },

      {
      "name": "Clean toilet",
      "categoryName": "Bathroom",
      "categoryId": "__BATHROOM_ID__",
      "points": 3
    },
    {
      "name": "Clean sink",
      "categoryName": "Bathroom",
      "categoryId": "__BATHROOM_ID__",
      "points": 2
    },
    {
      "name": "Clean shower or bathtub",
      "categoryName": "Bathroom",
      "categoryId": "__BATHROOM_ID__",
      "points": 4
    },
    {
      "name": "Wipe mirrors",
      "categoryName": "Bathroom",
      "categoryId": "__BATHROOM_ID__",
      "points": 1
    },
    {
      "name": "Replace towels",
      "categoryName": "Bathroom",
      "categoryId": "__BATHROOM_ID__",
      "points": 1
    },
    {
      "name": "Empty bathroom trash",
      "categoryName": "Bathroom",
      "categoryId": "__BATHROOM_ID__",
      "points": 1
    },
    {
      "name": "Refill toilet paper",
      "categoryName": "Bathroom",
      "categoryId": "__BATHROOM_ID__",
      "points": 1
    },

    {
      "name": "Make bed",
      "categoryName": "Bedroom",
      "categoryId": "__BEDROOM_ID__",
      "points": 1
    },
    {
      "name": "Change bedsheets",
      "categoryName": "Bedroom",
      "categoryId": "__BEDROOM_ID__",
      "points": 3
    },
    {
      "name": "Organize closet",
      "categoryName": "Bedroom",
      "categoryId": "__BEDROOM_ID__",
      "points": 3
    },
    {
      "name": "Fold and put away clothes",
      "categoryName": "Bedroom",
      "categoryId": "__BEDROOM_ID__",
      "points": 2
    },
    {
      "name": "Declutter nightstand and surfaces",
      "categoryName": "Bedroom",
      "categoryId": "__BEDROOM_ID__",
      "points": 1
    },

    {
      "name": "Tidy living room surfaces",
      "categoryName": "Living Room",
      "categoryId": "__LIVING_ROOM_ID__",
      "points": 1
    },
    {
      "name": "Vacuum couch",
      "categoryName": "Living Room",
      "categoryId": "__LIVING_ROOM_ID__",
      "points": 2
    },
    {
      "name": "Dust shelves and TV area",
      "categoryName": "Living Room",
      "categoryId": "__LIVING_ROOM_ID__",
      "points": 2
    },
    {
      "name": "Organize cables and remotes",
      "categoryName": "Living Room",
      "categoryId": "__LIVING_ROOM_ID__",
      "points": 1
    },
    {
      "name": "Vacuum or mop living room floor",
      "categoryName": "Living Room",
      "categoryId": "__LIVING_ROOM_ID__",
      "points": 3
    },

    {
      "name": "Sort laundry",
      "categoryName": "Laundry",
      "categoryId": "__LAUNDRY_ID__",
      "points": 1
    },
    {
      "name": "Wash laundry",
      "categoryName": "Laundry",
      "categoryId": "__LAUNDRY_ID__",
      "points": 2
    },
    {
      "name": "Hang laundry",
      "categoryName": "Laundry",
      "categoryId": "__LAUNDRY_ID__",
      "points": 2
    },
    {
      "name": "Use dryer / move clothes to dry",
      "categoryName": "Laundry",
      "categoryId": "__LAUNDRY_ID__",
      "points": 1
    },
    {
      "name": "Fold laundry",
      "categoryName": "Laundry",
      "categoryId": "__LAUNDRY_ID__",
      "points": 2
    },
    {
      "name": "Iron clothes",
      "categoryName": "Laundry",
      "categoryId": "__LAUNDRY_ID__",
      "points": 3
    },

    {
      "name": "Feed pet",
      "categoryName": "Pets",
      "categoryId": "__PETS_ID__",
      "points": 1
    },
    {
      "name": "Change water",
      "categoryName": "Pets",
      "categoryId": "__PETS_ID__",
      "points": 1
    },
    {
      "name": "Walk dog",
      "categoryName": "Pets",
      "categoryId": "__PETS_ID__",
      "points": 2
    },
    {
      "name": "Clean litter box or cage",
      "categoryName": "Pets",
      "categoryId": "__PETS_ID__",
      "points": 3
    },
    {
      "name": "Brush pet",
      "categoryName": "Pets",
      "categoryId": "__PETS_ID__",
      "points": 2
    },

    {
      "name": "Plan weekly meals",
      "categoryName": "Groceries & Errands",
      "categoryId": "__GROCERIES_ERRANDS_ID__",
      "points": 2
    },
    {
      "name": "Make shopping list",
      "categoryName": "Groceries & Errands",
      "categoryId": "__GROCERIES_ERRANDS_ID__",
      "points": 1
    },
    {
      "name": "Grocery shopping (big trip)",
      "categoryName": "Groceries & Errands",
      "categoryId": "__GROCERIES_ERRANDS_ID__",
      "points": 3
    },
    {
      "name": "Small top-up shopping",
      "categoryName": "Groceries & Errands",
      "categoryId": "__GROCERIES_ERRANDS_ID__",
      "points": 1
    },
    {
      "name": "Take packages to post office",
      "categoryName": "Groceries & Errands",
      "categoryId": "__GROCERIES_ERRANDS_ID__",
      "points": 2
    },
    {
      "name": "Pick up parcel",
      "categoryName": "Groceries & Errands",
      "categoryId": "__GROCERIES_ERRANDS_ID__",
      "points": 1
    },

    {
      "name": "Take out recycling",
      "categoryName": "Maintenance",
      "categoryId": "__MAINTENANCE_ID__",
      "points": 2
    },
    {
      "name": "Replace light bulbs",
      "categoryName": "Maintenance",
      "categoryId": "__MAINTENANCE_ID__",
      "points": 1
    },
    {
      "name": "Clean filters (AC, hood, vacuum, etc.)",
      "categoryName": "Maintenance",
      "categoryId": "__MAINTENANCE_ID__",
      "points": 3
    },
    {
      "name": "Check smoke detector batteries",
      "categoryName": "Maintenance",
      "categoryId": "__MAINTENANCE_ID__",
      "points": 2
    },
    {
      "name": "Small repairs (loose handles, screws, etc.)",
      "categoryName": "Maintenance",
      "categoryId": "__MAINTENANCE_ID__",
      "points": 3
    },

    {
      "name": "Sweep balcony or terrace",
      "categoryName": "Outdoors",
      "categoryId": "__OUTDOORS_ID__",
      "points": 2
    },
    {
      "name": "Water outdoor plants",
      "categoryName": "Outdoors",
      "categoryId": "__OUTDOORS_ID__",
      "points": 1
    },
    {
      "name": "Clean outdoor furniture",
      "categoryName": "Outdoors",
      "categoryId": "__OUTDOORS_ID__",
      "points": 3
    },
    {
      "name": "Take out compost",
      "categoryName": "Outdoors",
      "categoryId": "__OUTDOORS_ID__",
      "points": 2
    }
  ]
}