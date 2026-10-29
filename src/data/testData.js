
export const categories = [
    { id: 1, name: 'Кофе' },
    { id: 2, name: 'Чай' },
    { id: 3, name: 'Десерты' },
    { id: 4, name: 'Завтраки' },
];

export const dishes = [
    {
        id: 1,
        categoryId: 1,
        name: 'Айс-латте',
        price: 1500,
        image: '/images/ice-latte.jpg',
    },
    {
        id: 2,
        categoryId: 1,
        name: 'Капучино',
        price: 1200,
        image: '/images/cappuccino.jpg',
    },
    {
        id: 3,
        categoryId: 2,
        name: 'Зелёный чай',
        price: 800,
        image: '/images/green-tea.jpg',
    },
    {
        id: 4,
        categoryId: 3,
        name: 'Чизкейк',
        price: 1800,
        image: '/images/cheesecake.jpg',
    },
];
