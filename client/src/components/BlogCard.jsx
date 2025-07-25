
import BlogCards from './blogCards';

export default function BlogCard({ blog, onEdit, onDelete,  cardSize = 'normal', isAuthorView = false }) {
    const cardProps = {
        blog,
        onEdit,
        onDelete,
        cardSize,
        isAuthorView
    };
    return (
        <div className="w-full flex justify-center">
            <BlogCards {...cardProps}></BlogCards>
        </div>
    );
}