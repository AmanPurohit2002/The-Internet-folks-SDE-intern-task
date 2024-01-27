const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Community = require("../models/Community");
const Member = require("../models/Member");

const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const role = await Role.create({
      name: name,
    });

    const responseData = {
      status: true,
      content: {
        data: role.toJSON(),
      },
    };

    return res.status(201).json(responseData);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    // Extract page and limit from the query parameters
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Validate if the parameters are valid positive integers
    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid page or limit parameters" });
    }

    // Perform pagination using Mongoose skip and limit
    const roles = await Role.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Get total count of roles
    const totalRoles = await Role.countDocuments().exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalRoles / limitNumber);

    // Calculate the current page number
    const currentPage = roles.length > 0 ? pageNumber : 0;

    // Prepare the response JSON
    const responseData = {
      status: true,
      content: {
        meta: {
          total: totalRoles,
          pages: totalPages,
          page: currentPage,
        },
        data: roles,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const token = await newUser.generateAuthToken();

    const responseData = {
      status: true,
      content: {
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          created_at: newUser.created_at,
        },
        meta: {
          access_token: token,
        },
      },
    };

    return res.status(201).json(responseData);
  } catch (error) {
    return res.status(404).json({ status: false, error: error.message });
  }
};

const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ error: " email does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "password is incorrect" });
    }

    const token = existingUser.getLatestToken();

    const responseData = {
      status: true,
      content: {
        data: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          created_at: existingUser.created_at,
        },
        meta: {
          access_token: token,
        },
      },
    };

    return res.status(201).json(responseData);
  } catch (error) {
    return res.status(404).json({ status: false, error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.userId });

    const responseData = {
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      },
    };

    return res.status(201).json(responseData);
  } catch (error) {
    return res.status(404).json({ status: false, error: error.message });
  }
};

const createCommunity = async (req, res) => {
  try {
    const { name } = req.body;
    const owner = req.userId;

    const community = await Community.create({
      name,
      owner,
    });

    const adminRole = await Role.findOne({ name: "Community Admin" });

    await Member.create({
      community: community.id,
      user: owner,
      role: adminRole.id,
    });

    // const responseData = {
    //     status: true,
    //     content: {
    //         data: newCommunity.toJSON(),
    //     },
    // };
    const responseData = {
      status: true,
      content: {
        data: {
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: community.owner,
          created_at: community.created_at,
          updated_at: community.updated_at,
        },
      },
    };

    return res.status(201).json(responseData);
  } catch (error) {
    return res.status(404).json({ status: false, error: error.message });
  }
};

const getAllCommunity = async (req, res) => {
  try {
    const pageNumber = 1;
    const limitNumber = 10;

    // Perform pagination using Mongoose skip and limit
    const communities = await Community.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Get total count of communities
    const totalCommunities = await Community.countDocuments().exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalCommunities / limitNumber);

    // Calculate the current page number
    const currentPage = communities.length > 0 ? pageNumber : 0;

    const expandedCommunities = await Promise.all(
      communities.map(async (community) => {
        const owner = await User.findOne(
          { id: community.owner },
          { id: 1, name: 1 }
        );

        return {
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: owner.id,
            name: owner.name,
          },
          created_at: community.created_at,
          updated_at: community.updated_at,
        };
      })
    );

    const responseData = {
      status: true,
      content: {
        meta: {
          total: totalCommunities,
          pages: totalPages,
          page: currentPage,
        },
        data: expandedCommunities,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const pageNumber = 1;
    const limitNumber = 10;

    // Perform pagination using Mongoose skip and limit
    const members = await Member.find({ community: id })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Get total count of members in the community
    const totalMembers = await Member.countDocuments({ community: id }).exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalMembers / limitNumber);

    // Calculate the current page number
    const currentPage = members.length > 0 ? pageNumber : 0;

    // Prepare the response JSON with expanded user and role details
    const expandedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await User.findOne(
          { id: member.user },
          { id: 1, name: 1 }
        );
        const role = await Role.findOne(
          { id: member.role },
          { id: 1, name: 1 }
        );

        return {
          id: member.id,
          community: member.community,
          user: {
            id: user.id,
            name: user.name,
          },
          role: {
            id: role.id,
            name: role.name,
          },
          created_at: member.created_at,
        };
      })
    );

    // Prepare the response JSON
    const responseData = {
      status: true,
      content: {
        meta: {
          total: totalMembers,
          pages: totalPages,
          page: currentPage,
        },
        data: expandedMembers,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

const getAllCommunityMadeByUser = async (req, res) => {
  try {
    const owner = req.userId;

    const pageNumber = 1;
    const limitNumber = 10;

    // Perform pagination using Mongoose skip and limit
    const ownedCommunities = await Community.find({ owner })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Get total count of owned communities
    const totalOwnedCommunities = await Community.countDocuments({
      owner,
    }).exec();

    if (totalOwnedCommunities === 0)
      return res.status(400).json({ error: "Owner has not made a community" });

    // Calculate total pages
    const totalPages = Math.ceil(totalOwnedCommunities / limitNumber);

    // Calculate the current page number
    const currentPage = ownedCommunities.length > 0 ? pageNumber : 0;

    // Prepare the response JSON
    const responseData = {
      status: true,
      content: {
        meta: {
          total: totalOwnedCommunities,
          pages: totalPages,
          page: currentPage,
        },
        data: ownedCommunities.map((community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: community.owner,
          created_at: community.created_at,
          updated_at: community.updated_at,
        })),
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(404).json({ status: false, error: error.message });
  }
};


const getAllCommunityUserIsMember = async (req, res) => {
  try {
    const owner = req.userId;
    const pageNumber = 1;
    const limitNumber = 10;

    // Get the members with pagination
    const members = await Member.find({ user: owner })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    const totalJoinedCommunities = await Member.countDocuments({
      user: owner,
    }).exec();

    const totalPages = Math.ceil(totalJoinedCommunities / limitNumber);
    const currentPage = members.length > 0 ? pageNumber : 0;

    // Fetch details for each member
    const communitySet = new Set(); // Use a Set to filter duplicates

    await Promise.all(
      members.map(async (member) => {
        const community = await Community.findOne({
          id: member.community,
          owner: member.user,
        })
          .lean()
          .exec();

        if (community) {
          const owner = await User.findOne(
            { id: community.owner },
            { id: 1, name: 1 }
          )
            .lean()
            .exec();

          communitySet.add({
            id: community.id,
            name: community.name,
            slug: community.slug,
            owner: {
              id: owner.id.toString(),
              name: owner.name,
            },
            created_at: community.created_at,
            updated_at: community.updated_at,
          });
        }
      })
    );

    const responseData = {
      status: true,
      content: {
        meta: {
          total: communitySet.size, // Use Set size to get unique communities
          pages: totalPages,
          page: currentPage,
        },
        data: Array.from(communitySet), // Convert Set to Array
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { community, user, role } = req.body;
    const requester = req.userId;

    const adminRole = await Role.findOne({ name: "Community Admin" });

    // check requested user role is admin or not
    const requesterRole = await Member.findOne({
      community,
      user: requester,
      role: adminRole.id,
    });

    if (!requesterRole) {
      return res.status(403).json({
        status: false,
        error: "NOT_ALLOWED_ACCESS",
      });
    }

    const member = await Member.create({
      community,
      user,
      role,
    });

    const responseData = {
      status: true,
      content: {
        data: {
          id: member.id,
          community: member.community,
          user: member.user,
          role: member.role,
          created_at: member.created_at,
        },
      },
    };

    return res.status(201).json(responseData);
  } catch (error) {
    return res.status(404).json({ status: false, error: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.userId;

    const isMemberExists = await Member.findOne({ id });

    if (!isMemberExists) {
      return res.status(404).json({
        status: false,
        error: "Member not found",
      });
    }

    const adminRole = await Role.findOne({ name: "Community Admin" });
    const moderatorRole = await Role.findOne({ name: "Community Moderator" });

    const requesterRole = await Member.findOne({
      community: isMemberExists.community,
      user: requester,
      role: { $in: [adminRole.id, moderatorRole.id] },
    });

    if (!requesterRole) {
      return res.status(403).json({
        status: false,
        error: "NOT_ALLOWED_ACCESS",
      });
    }

    await Member.deleteOne({ id: id });

    const responseData = {
      status: true,
    };

    return res.status(201).json(responseData);
  } catch (error) {
    return res.status(404).json({ status: false, error: error.message });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  signupUser,
  signinUser,
  getUser,
  createCommunity,
  getAllCommunity,
  addMember,
  deleteMember,
  getAllMembers,
  getAllCommunityMadeByUser,
  getAllCommunityUserIsMember,
};
