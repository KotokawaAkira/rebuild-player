function sort(music_list) {
    let sorted = [];
    let names = [];
    music_list.forEach(element => {
        let splits = element.name.split(" - ");
        let index = names.indexOf(splits[0]);
        if (index !== -1) {
            names.splice(index, 0, splits[0]);
            sorted.splice(index, 0, element);
        } else {
            names.push(splits[0]);
            sorted.push(element);
        }
    });
    sorted.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
    return sorted;
}

export default sort;