import { requireAuth } from "@/lib/auth/utils"
import { redirect } from "next/navigation"
import { getAllAuditLogs, getAuditLogStats } from "@/lib/audit/logger"

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const user = await requireAuth()

  // Only admins can access audit logs
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const page = parseInt(searchParams.page || "1")
  const { logs, total, totalPages, hasMore } = await getAllAuditLogs(page, 50)
  const stats = await getAuditLogStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">
          Security and activity monitoring for the dashboard
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Logs</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalLogs.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Last 24h</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {stats.logsLast24h}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Last 7d</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            {stats.logsLast7d}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Failed Logins (24h)</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {stats.failedLoginsLast24h}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Active Users (24h)</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {stats.uniqueUsersLast24h}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity (Page {page} of {totalPages})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => {
                const isFailedLogin = log.action === "LOGIN_FAILED"
                const isLogin = log.action === "LOGIN"
                const isRegister = log.action === "REGISTER"
                const isEmailVerified = log.action === "EMAIL_VERIFIED"

                return (
                  <tr
                    key={log.id}
                    className={
                      isFailedLogin ? "bg-red-50" :
                      isLogin ? "bg-green-50" :
                      isRegister ? "bg-blue-50" :
                      isEmailVerified ? "bg-purple-50" :
                      ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.user?.email || "N/A"}
                      {log.user?.name && (
                        <div className="text-xs text-gray-500">{log.user.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isLogin ? "bg-green-100 text-green-800" :
                          isFailedLogin ? "bg-red-100 text-red-800" :
                          isRegister ? "bg-blue-100 text-blue-800" :
                          isEmailVerified ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.ipAddress || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                          View
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * 50 + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * 50, total)}</span> of{" "}
            <span className="font-medium">{total}</span> logs
          </div>

          <div className="flex space-x-2">
            {page > 1 && (
              <a
                href={`/dashboard/admin/audit-logs?page=${page - 1}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Previous
              </a>
            )}

            {hasMore && (
              <a
                href={`/dashboard/admin/audit-logs?page=${page + 1}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
