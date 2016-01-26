JSM.Application = {

    init: function(data) {
        JSM.send('getDishes', {category: "Entrees"});
    },

    gotDishes: function(data) {

        var dishes = [];

        for(dish in data) {
            dishes.push([dish]);
        }

        $("#dishes").DataTable({data: dishes,
                                columns: [
                                    {title: "Dishes"}
                                ]});


    }
};