export default function Clients() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client information</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
          Add Client
        </button>
      </div>
      <div className="p-6 border rounded-lg">
        <p className="text-sm text-muted-foreground">No clients yet. Add your first client to get started.</p>
      </div>
    </div>
  )
}