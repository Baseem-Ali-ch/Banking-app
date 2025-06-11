import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage: number
    totalItems: number
}

export function AdminPagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }: PaginationProps) {
    return (
        <Pagination className="mt-4 mb-10">
            <PaginationContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Navigation Controls - Left side */}
                <div className="flex items-center gap-5">
                    <PaginationItem>
                        <PaginationLink
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="gap-1 w-20 border border-gray-200 justify-center cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Prev
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationLink
                            isActive={true}
                            className="gap-1 px-3"
                        >
                             {currentPage} / {totalPages}
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationLink
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="gap-1 w-20 border border-gray-200 justify-center cursor-pointer"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>
                </div>
            </PaginationContent>
        </Pagination>
    )
}
