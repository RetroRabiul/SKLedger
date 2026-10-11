export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Track your projects, work description, amounts, and payments</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
          Add Project
        </button>
      </div>
      <div className="p-6 border rounded-lg">
        <p className="text-sm text-muted-foreground">No projects yet. Add your first project to track revenue.</p>
      </div>
    </div>
  )
}