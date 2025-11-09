const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
      {icon}
      <span className="ml-3">{title}</span>
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

export default Section;