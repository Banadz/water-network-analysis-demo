const SidebarButton = ({ icon: Icon, label, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center w-full space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        >
            <Icon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
    );
}

export default SidebarButton;
