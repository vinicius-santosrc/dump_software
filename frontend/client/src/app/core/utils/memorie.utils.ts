const getMemoriesCreationMenu = (hasStory: boolean) => {
    const menu = [
        {
            name: "Criar story",
            icon: "add",
            action: "createStory"
        },
        {
            name: "Criar post",
            icon: "post_add",
            action: "createPost"
        },
        {
            name: "Iniciar transmissão",
            icon: "videocam",
            action: "createLive"
        },
        {
            name: "Criar evento",
            icon: "event",
            action: "createEvent"
        },
    ];

    if (!hasStory) {
        menu.unshift({
            name: "Visualizar story atual",
            icon: "visibility",
            action: "viewCurrentStory"
        });
    }

    return menu;
}

export { getMemoriesCreationMenu };