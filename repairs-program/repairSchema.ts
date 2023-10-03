export type API = {
    // List or find repairs assigned to a user
    listRepairs(assignedTo?: string): {
        id: number;
        title: string;
        description: string;
        assignedTo: string;
        date: string;
        image: string;
    }[];

    // New function for creating a repair
    createRepair(title: string, description: string, assignedTo: string, date: string, image: string): {
        id: number;
    };
}