import React, { useEffect, useState } from "react";
import { inviteUser, getInvitations, acceptInvitation, rejectInvitation } from "../services/authApi";
import { Invitation } from "../types/auth";
import { FiSend, FiInbox, FiMail, FiCheck, FiX } from "react-icons/fi";

const Invite: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await getInvitations();
      if (response.status === 'success' && response.data) {
        setSentInvitations(response.data.sentInvitations);
        setReceivedInvitations(response.data.receivedInvitations);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch invitations');
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      setError("Please enter an email address");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await inviteUser({
        email: inviteEmail,
        first_name: "FirstName", 
        last_name: "LastName",
        role: "USER" 
      });
      if (data.error){
        setError(data.error.message);
      }
      setInviteEmail("");
      await fetchInvitations();
    } catch (err) {
      setError("Failed to send invitation or Email not found");
      console.error("Error sending invitation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (invitationId: number) => {
    setIsLoading(true);
    try {
      await acceptInvitation(invitationId);
      await fetchInvitations();
    } catch (err) {
      setError("Failed to accept invitation");
      console.error("Error accepting invitation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async (invitationId: number) => {
    setIsLoading(true);
    try {
      await rejectInvitation(invitationId);
      await fetchInvitations();
    } catch (err) {
      setError("Failed to reject invitation");
      console.error("Error rejecting invitation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInvitationStatus = (status: string) => {
    const statusStyles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-green-800",
      DECLINED: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Invite User Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <FiMail className="text-2xl text-gray-700 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Give Access</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleInviteUser}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400 flex items-center justify-center"
          >
            {isLoading ? (
              "Sending..."
            ) : (
              <>
                <FiSend className="mr-2" />
                Invite
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Invitations Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 flex items-center ${
              activeTab === "sent"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("sent")}
          >
            <FiSend className="mr-2" />
            Sent Invitations
          </button>
          <button
            className={`py-2 px-4 flex items-center ${
              activeTab === "received"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("received")}
          >
            <FiInbox className="mr-2" />
            Received Invitations
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : activeTab === "sent" ? (
          // Sent Invitations
          sentInvitations.length === 0 ? (
            <div className="text-gray-500 text-center py-8 flex flex-col items-center">
              <FiSend className="text-4xl mb-2" />
              <p>No sent invitations available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sentInvitations.map((invitation) => (
                <div key={invitation.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <FiMail className="text-gray-400 mt-1 mr-2" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {invitation.invitee?.email}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {invitation.invitee?.name || "No name"}
                        </p>
                      </div>
                    </div>
                    {renderInvitationStatus(invitation.status)}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Received Invitations
          receivedInvitations.length === 0 ? (
            <div className="text-gray-500 text-center py-8 flex flex-col items-center">
              <FiInbox className="text-4xl mb-2" />
              <p>No received invitations available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {receivedInvitations.map((invitation) => (
                <div key={invitation.id} className="border rounded-lg p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <FiMail className="text-gray-400 mt-1 mr-2" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {invitation.inviter?.email}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {invitation.inviter?.name || "No name"}
                          </p>
                        </div>
                      </div>
                      {renderInvitationStatus(invitation.status)}
                    </div>
                    {invitation.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptInvite(invitation.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                        >
                          <FiCheck className="mr-2" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectInvite(invitation.id)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                        >
                          <FiX className="mr-2" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Invite;