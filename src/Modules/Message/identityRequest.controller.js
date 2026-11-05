
import {
  requestIdentity,
  getIdentityRequests,
  respondToIdentityRequest,
} from "./identityRequest.service.js";

// Request sender identity
export const requestIdentityController = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const result = await requestIdentity({
      messageId,
      requesterId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Identity request created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get identity requests received by the logged-in sender
export const getIdentityRequestsController = async (req, res, next) => {
  try {
    const requests = await getIdentityRequests(req.user.userId);

    return res.status(200).json({
      success: true,
      results: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Accept or reject an identity request
export const respondToIdentityRequestController = async (
  req,
  res,
  next
) => {
  try {
    const { requestId } = req.params;
    const { decision } = req.body;

    const result = await respondToIdentityRequest({
      requestId,
      senderId: req.user.userId,
      decision,
    });

    return res.status(200).json({
      success: true,
      message: `Identity request ${decision} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
