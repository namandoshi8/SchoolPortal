import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
// import { resultsData, role } from "@/lib/data";
import fetchUserRole from "@/lib/fetchUserRole";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  Class,
  Prisma,
  Result,
  Student,
  Subject,
  Teacher,
} from "@prisma/client";
import Image from "next/image";

type ResultList = {
  id: number;
  title: string;
  student: string;
  score: number;
  teacher: string;
  class: string;
  startTime: Date;
};

const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Score",
    accessor: "score",
    className: "hidden md:table-cell",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

async function ResultListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const role = await fetchUserRole();

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.student}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td className="hidden md:table-cell">{item.class}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal table="result" type="update" data={item} />
              <FormModal table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? Number(page) : 1;

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            // query.title = { contains: value, mode: "insensitive" };
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              {
                assignment: { title: { contains: value, mode: "insensitive" } },
              },
              { student: { name: { contains: value, mode: "insensitive" } } },
              { score: parseInt(value) },
            ];
            break;
          case "studentId":
            query.studentId = value;
            break;

            break;
        }
      }
    }
  }

  const [resultData, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: true,
        exam: {
          include: {
            lesson: {
              include: {
                class: true,
                subject: true,
                teacher: true,
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              include: {
                class: true,
                subject: true,
                teacher: true,
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1), //pagination
    }),
    prisma.result.count({ where: query }),
  ]);

  const resultsDatas = resultData.map((result) => {
    const assessment = result.exam || result.assignment;
    if (!assessment) return null;

    const isExam = "startTime" in assessment;

    return {
      id: result.id,
      title: assessment.title,
      student: result.student.name,
      score: result.score,
      teacher: assessment.lesson.teacher.name,
      class: assessment.lesson.class.name,
      startTime: isExam ? assessment.startTime : assessment.startDate,
    };
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormModal table="result" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={resultsDatas} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}

export default ResultListPage;
