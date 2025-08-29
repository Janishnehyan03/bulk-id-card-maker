import { LayoutTemplate, Users } from "lucide-react";
import { Link } from "react-router-dom";

// shadcn/ui Card primitives (replace with your design system's import if needed)
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-border bg-background shadow-lg transition-shadow duration-200 " +
        className
      }
      tabIndex={-1}
      role="region"
    >
      {children}
    </div>
  );
}
function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={"p-6 " + className}>{children}</div>;
}

function DashboardCard({
  to,
  icon,
  title,
  description,
  iconBg,

  ariaLabel,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  ariaLabel: string;
}) {
  // Tailwind dark: and light: for dual-mode color
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className="group outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl transition-transform"
    >
      <Card className="h-full bg-card hover:shadow-xl active:shadow-md focus-within:shadow-xl transition-all duration-200 group-hover:-translate-y-1 group-active:scale-95">
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-xl ${iconBg} transition-colors duration-200 group-hover:bg-opacity-80`}
              aria-hidden="true"
            >
              {/* Icon color adapts to dark mode */}
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="sr-only">{title} section</p>
            </div>
          </div>
          <p className="mt-6 text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-muted/50 dark:bg-background flex items-center justify-center px-4 py-8">
      <section
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8"
        aria-label="Dashboard Navigation"
      >
        <DashboardCard
          to="/templates"
          ariaLabel="Templates"
          iconBg="bg-blue-100 dark:bg-blue-950"
          icon={
            <LayoutTemplate className="w-7 h-7 text-blue-600 dark:text-blue-400 transition-colors duration-200" />
          }
          title="Templates"
          description="Browse and manage reusable templates for faster, more consistent workflows."
          iconColor="text-blue-600"
        />
        <DashboardCard
          to="/customers"
          ariaLabel="Customers"
          iconBg="bg-green-100 dark:bg-green-950"
          icon={
            <Users className="w-7 h-7 text-green-600 dark:text-green-400 transition-colors duration-200" />
          }
          title="Customers"
          description="Keep track of customer details and manage relationships easily and efficiently."
          iconColor="text-green-600"
        />
      </section>
    </main>
  );
}
