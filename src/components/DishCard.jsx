function DishCard({ image, name, price }) {
    return (
        <article className="dish-card">
            <img
                className="dish-card__image"
                src={image}
                alt={name}
            />

            <div className="dish-card__info">
                <h3>{name}</h3>
                <p className="dish-card__price">
                    {price.toLocaleString('ru-RU')} ₸
                </p>
            </div>
        </article>
    );
}

export default DishCard;