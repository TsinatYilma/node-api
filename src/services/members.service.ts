import Member  from '../models/members.model';

//members service
export async function create(dto: {
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'faculty' | 'staff';
}) {
  const exists = await Member.findOne({ email: dto.email });
  if (exists) {
    throw new Error('Member already exists');
  }

  const phoneExists = await Member.findOne({ phone: dto.phone });
  if (phoneExists) {
    throw new Error('Member already exists');
  }

  return Member.create(dto);
}

//count members
export async function count(): Promise<number> {
  return Member.countDocuments();
}

//find all members
export async function findAll() {
  return Member.aggregate([
    // 1️ Join borrowedbooks by email
    {
      $lookup: {
        from: 'borrowedbooks',
        localField: 'email',
        foreignField: 'borrowerId',
        as: 'borrowedBooks',
      },
    },

    // 2️ Lookup books using ObjectId conversion
    {
      $lookup: {
        from: 'books',
        let: { bookIds: '$borrowedBooks.bookId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  '$_id',
                  {
                    $map: {
                      input: '$$bookIds',
                      as: 'id',
                      in: { $toObjectId: '$$id' },
                    },
                  },
                ],
              },
            },
          },
          { $project: { title: 1 } },
        ],
        as: 'issuedBooks',
      },
    },

    // 3️ Add computed fields
    {
      $addFields: {
        booksIssued: { $size: '$borrowedBooks' },
        issuedBookTitles: {
          $map: {
            input: '$issuedBooks',
            as: 'book',
            in: {
              title: '$$book.title',
              bookId: '$$book._id',
            },
          },
        },
      },
    },

    // 4️ Cleanup
    {
      $project: {
        borrowedBooks: 0,
        issuedBooks: 0,
        __v: 0,
      },
    },
  ]);
}


//REMOVE MEMBER
 
export async function removeMember(
  id: string
): Promise<{ message: string }> {
  const result = await Member.findByIdAndDelete(id);

  if (!result) {
    throw new Error('Member not found');
  }

  return { message: 'Member successfully deleted' };
}
